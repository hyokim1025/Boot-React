import { useIsMutating, useMutation, useMutationState, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRecoilValue } from 'recoil';
import { getCartItems, postChangeCart } from '../api/cartApi';
import { cartItemsState, cartKey } from '../atoms/cartState';
import signinState, { getSession } from '../atoms/signinState';

const useCustomCart = () => {
  const { sessionId } = useRecoilValue(signinState);
  const cartItems = useRecoilValue(cartItemsState);
  const queryClient = useQueryClient();
  const queryKey = cartKey(sessionId);
  const mutationKey = ['cart-change', sessionId];
  const query = useQuery({
    queryKey,
    queryFn: ({ signal }) => getCartItems({ signal, sessionId }),
    enabled: Boolean(sessionId),
  });

  const { mutate } = useMutation({
    mutationKey,
    mutationFn: ({ item, sessionId }) => postChangeCart(item, { sessionId }),
    onSuccess: async (items, { sessionId }) => {
      if (getSession().sessionId !== sessionId) return;
      const key = cartKey(sessionId);
      await queryClient.cancelQueries({ queryKey: key });
      if (getSession().sessionId === sessionId) {
        queryClient.setQueryData(key, items);
      }
    },
  });
  const saving = useIsMutating({ mutationKey }) > 0;
  const lastFailure = useMutationState({
    filters: { mutationKey },
    select: ({ state }) => state.status === 'error' ? state.submittedAt : 0,
  }).at(-1);

  const loaded = query.data !== undefined;
  const busy = query.isFetching || saving;
  const error = query.isError ? '장바구니를 불러오지 못했습니다.'
    : lastFailure > query.dataUpdatedAt ? '장바구니를 변경하지 못했습니다.' : '';
  const refreshCart = () => {
    if (!queryClient.isMutating({ mutationKey })) query.refetch();
  };
  const changeCart = (item) => {
    if (loaded && !queryClient.isFetching({ queryKey }) && !queryClient.isMutating({ mutationKey })) {
      mutate({ item, sessionId });
    }
  };

  return { cartItems, loaded, busy, error, refreshCart, changeCart };
};

export default useCustomCart;
