import { createAsyncThunk, createSlice, isAnyOf } from '@reduxjs/toolkit';
import { logout } from './loginSlice';

const initialState = { items: [], sessionId: null, requestId: null, loaded: false, error: '' };

const canRequest = ({ sessionId }, { getState }) => {
  const { cartSlice, loginSlice } = getState();
  return Boolean(sessionId && sessionId === loginSlice.sessionId
    && (cartSlice.sessionId !== sessionId || !cartSlice.requestId));
};

export const getCartItemsAsync = createAsyncThunk('cart/getItems',
  ({ sessionId }, { extra, signal }) => extra.getCartItems({ signal, sessionId }),
  { condition: canRequest });

export const postChangeCartAsync = createAsyncThunk('cart/change',
  ({ sessionId, item }, { extra, signal }) => extra.postChangeCart(item, { signal, sessionId }),
  { condition: canRequest });

const cartSlice = createSlice({
  name: 'cartSlice',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(logout, () => initialState)
      .addMatcher(isAnyOf(getCartItemsAsync.pending, postChangeCartAsync.pending), (state, { meta }) => {
        const { sessionId } = meta.arg;
        return {
          ...(state.sessionId === sessionId ? state : initialState),
          sessionId,
          requestId: meta.requestId,
          error: '',
        };
      })
      .addMatcher(isAnyOf(getCartItemsAsync.fulfilled, postChangeCartAsync.fulfilled), (state, { meta, payload }) => {
        if (state.requestId === meta.requestId) {
          state.items = payload;
          state.loaded = true;
          state.requestId = null;
        }
      })
      .addMatcher(isAnyOf(getCartItemsAsync.rejected, postChangeCartAsync.rejected), (state, { meta, type }) => {
        if (state.requestId === meta.requestId) {
          state.error = type === getCartItemsAsync.rejected.type
            ? '장바구니를 불러오지 못했습니다.'
            : '장바구니를 변경하지 못했습니다.';
          state.requestId = null;
        }
      });
  },
});

export const selectCart = ({ loginSlice, cartSlice }) => (
  loginSlice.sessionId === cartSlice.sessionId ? cartSlice : initialState
);

export default cartSlice.reducer;
