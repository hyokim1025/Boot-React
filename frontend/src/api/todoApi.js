import { API_SERVER_HOST } from './memberApi';
import jwtAxios from '../util/jwtUtil';

export { API_SERVER_HOST };

const prefix = `${API_SERVER_HOST}/api/todo`;

export const getOne = async (tno, signal) => {
  const response = await jwtAxios.get(`${prefix}/${tno}`, { signal });
  return response.data;
};

export const getList = async ({ page, size }, signal) => {
  const response = await jwtAxios.get(`${prefix}/list`, { params: { page, size }, signal });
  return response.data;
};

export const postAdd = async (todo) => {
  const response = await jwtAxios.post(`${prefix}/`, todo);
  return response.data;
};

export const putOne = async (todo) => {
  const response = await jwtAxios.put(`${prefix}/${todo.tno}`, todo);
  return response.data;
};

export const deleteOne = async (tno) => {
  const response = await jwtAxios.delete(`${prefix}/${tno}`);
  return response.data;
};
