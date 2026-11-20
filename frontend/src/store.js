import { configureStore, createListenerMiddleware } from '@reduxjs/toolkit';
import * as cartApi from './api/cartApi';
import cartSlice from './slices/cartSlice';
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
  reducer: { loginSlice, cartSlice },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({ thunk: { extraArgument: cartApi } })
    .prepend(memberStorage.middleware),
  devTools: false,
});
