import axios from 'axios';
import { API_SERVER_HOST } from './todoApi';

const host = `${API_SERVER_HOST}/api/products`;

export const getList = async ({ page, size }, signal) => {
  const response = await axios.get(`${host}/list`, { params: { page, size }, signal });
  return response.data;
};

export const getOne = async (pno, signal) => {
  const response = await axios.get(`${host}/${pno}`, { signal });
  return response.data;
};

export const postAdd = async (formData) => {
  const response = await axios.post(`${host}/`, formData);
  return response.data;
};

export const putOne = async (pno, formData) => {
  const response = await axios.put(`${host}/${pno}`, formData);
  return response.data;
};

export const deleteOne = async (pno) => {
  const response = await axios.delete(`${host}/${pno}`);
  return response.data;
};

export const getImageUrl = (fileName, thumbnail = false) => {
  const prefix = thumbnail ? 's_' : '';
  return `${host}/view/${encodeURIComponent(prefix + fileName)}`;
};
