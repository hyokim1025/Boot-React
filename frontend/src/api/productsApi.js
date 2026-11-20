import { API_SERVER_HOST } from './memberApi';
import jwtAxios from '../util/jwtUtil';

const host = `${API_SERVER_HOST}/api/products`;

export const productListKey = (sessionId) => ['products', sessionId, 'list'];
export const productDetailKey = (sessionId, pno) => ['products', sessionId, 'detail', String(pno)];

export const getList = async ({ page, size }, { signal, sessionId }) => {
  const response = await jwtAxios.get(`${host}/list`, { params: { page, size }, signal, authSession: sessionId });
  return response.data;
};

export const getOne = async (pno, { signal, sessionId }) => {
  const response = await jwtAxios.get(`${host}/${pno}`, { signal, authSession: sessionId });
  return response.data;
};

export const postAdd = async (formData, sessionId) => {
  const response = await jwtAxios.post(`${host}/`, formData, { authSession: sessionId });
  return response.data;
};

export const putOne = async (pno, formData, sessionId) => {
  const response = await jwtAxios.put(`${host}/${pno}`, formData, { authSession: sessionId });
  return response.data;
};

export const deleteOne = async (pno, sessionId) => {
  const response = await jwtAxios.delete(`${host}/${pno}`, { authSession: sessionId });
  return response.data;
};

export const getImageUrl = (fileName, thumbnail = false) => {
  const prefix = thumbnail ? 's_' : '';
  return `${host}/view/${encodeURIComponent(prefix + fileName)}`;
};
