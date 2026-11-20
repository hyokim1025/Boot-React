import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getCartItemsAsync, postChangeCartAsync, selectCart } from '../slices/cartSlice';

const useCustomCart = () => {
  const dispatch = useDispatch();
  const sessionId = useSelector((state) => state.loginSlice.sessionId);
  const { items, requestId, loaded, error } = useSelector(selectCart);

  const refreshCart = useCallback(() => dispatch(getCartItemsAsync({ sessionId })), [dispatch, sessionId]);
  const changeCart = (item) => dispatch(postChangeCartAsync({ sessionId, item }));

  return { cartItems: items, loaded, busy: Boolean(requestId), error, refreshCart, changeCart };
};

export default useCustomCart;
