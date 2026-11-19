import axios from 'axios';
import { API_SERVER_HOST } from './memberApi';

const host = `${API_SERVER_HOST}/api/member/kakao`;

export const startKakaoLogin = async () => {
  const { data } = await axios.post(`${host}/start`, null, { withCredentials: true });
  return data.url;
};

export const finishKakaoLogin = async (code, state) => {
  const { data } = await axios.post(host, { code, state }, { withCredentials: true });
  return data;
};
