import { atom, selector } from 'recoil';
import queryClient from '../queryClient';
import signinState, { getSession } from './signinState';

const emptyItems = [];
export const cartKey = (sessionId) => ['cart', sessionId];

const cartState = atom({
  key: 'cartState',
  default: { sessionId: null, items: emptyItems },
  effects: [
    ({ setSelf }) => {
      let last;
      const syncCart = () => {
        const { sessionId } = getSession();
        const items = queryClient.getQueryData(cartKey(sessionId)) ?? emptyItems;
        if (last?.sessionId !== sessionId || last.items !== items) {
          last = { sessionId, items };
          setSelf(last);
        }
      };

      syncCart();
      return queryClient.getQueryCache().subscribe(({ query, type }) => {
        if (query.queryKey[0] === 'cart' && (type === 'updated' || type === 'removed')) {
          syncCart();
        }
      });
    },
  ],
});

export const cartItemsState = selector({
  key: 'cartItemsState',
  cachePolicy_UNSTABLE: { eviction: 'most-recent' },
  get: ({ get }) => {
    const cart = get(cartState);
    return cart.sessionId === get(signinState).sessionId ? cart.items : emptyItems;
  },
});

export const cartTotalState = selector({
  key: 'cartTotalState',
  cachePolicy_UNSTABLE: { eviction: 'most-recent' },
  get: ({ get }) => get(cartItemsState).reduce((total, item) => total + item.price * item.qty, 0),
});
