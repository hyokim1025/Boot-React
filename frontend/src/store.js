import { configureStore, createListenerMiddleware } from '@reduxjs/toolkit';
import loginSlice from './slices/loginSlice';
import { removeMemberCookie, saveMemberCookie } from './util/cookieUtil';

const memberStorage = createListenerMiddleware();

memberStorage.startListening({
  predicate: (_action, current, previous) => current.loginSlice.member !== previous.loginSlice.member,
  effect: (_action, { getState }) => {
    const { member } = getState().loginSlice;
    if (member) {
      saveMemberCookie(member);
    } else {
      removeMemberCookie();
    }
  },
});

export default configureStore({
  reducer: { loginSlice },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().prepend(memberStorage.middleware),
  devTools: false,
});
