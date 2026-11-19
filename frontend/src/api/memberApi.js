import axios from 'axios';

export const API_SERVER_HOST = 'http://localhost:8080';

const host = `${API_SERVER_HOST}/api/member`;

export const loginPost = async ({ email, pw }, signal) => {
  const form = new URLSearchParams({ username: email.trim(), password: pw });
  const { data } = await axios.post(`${host}/login`, form, { signal });
  return data;
};

export const refreshJWT = async (accessToken, refreshToken) => {
  const body = new URLSearchParams({ refreshToken });
  const { data } = await axios.post(`${host}/refresh`, body, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return data;
};
