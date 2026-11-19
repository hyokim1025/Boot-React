import axios from 'axios';

export const API_SERVER_HOST = 'http://localhost:8080';

const prefix = `${API_SERVER_HOST}/api/todo`;

export const getOne = async (tno, signal) => {
  const response = await axios.get(`${prefix}/${tno}`, { signal });
  return response.data;
};

export const getList = async ({ page, size }, signal) => {
  const response = await axios.get(`${prefix}/list`, { params: { page, size }, signal });
  return response.data;
};

export const postAdd = async (todo) => {
  const response = await axios.post(`${prefix}/`, todo);
  return response.data;
};

export const putOne = async (todo) => {
  const response = await axios.put(`${prefix}/${todo.tno}`, todo);
  return response.data;
};

export const deleteOne = async (tno) => {
  const response = await axios.delete(`${prefix}/${tno}`);
  return response.data;
};
