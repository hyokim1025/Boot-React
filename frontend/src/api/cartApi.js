import jwtAxios from '../util/jwtUtil';

const host = '/api/cart';

export const getCartItems = async ({ signal, sessionId }) => {
  const { data } = await jwtAxios.get(`${host}/items`, { signal, authSession: sessionId });
  return data;
};

export const postChangeCart = async (item, { signal, sessionId }) => {
  const { data } = await jwtAxios.post(`${host}/change`, item, { signal, authSession: sessionId });
  return data;
};
