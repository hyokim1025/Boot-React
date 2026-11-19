import axios from 'axios';
import { API_SERVER_HOST, refreshJWT } from '../api/memberApi';
import { logout, updateTokens } from '../slices/loginSlice';
import store from '../store';

const jwtAxios = axios.create({ baseURL: API_SERVER_HOST });
const apiOrigin = new URL(API_SERVER_HOST).origin;
let pendingRefresh;

jwtAxios.interceptors.request.use((config) => {
  const { member, sessionId } = store.getState().loginSlice;

  if (config.authSession && config.authSession !== sessionId) {
    throw new axios.CanceledError('Login changed');
  }
  if (new URL(jwtAxios.getUri(config), API_SERVER_HOST).origin === apiOrigin && member) {
    config.authSession = sessionId;
    config.headers.set('Authorization', `Bearer ${member.accessToken}`);
  }
  return config;
});

const refreshOnce = (sessionId, member) => {
  if (pendingRefresh?.sessionId === sessionId && pendingRefresh.accessToken === member.accessToken) {
    return pendingRefresh.promise;
  }

  const job = { sessionId, accessToken: member.accessToken };
  job.promise = refreshJWT(member.accessToken, member.refreshToken)
    .then(({ accessToken, refreshToken }) => {
      if (!accessToken || !refreshToken) {
        throw new Error('Invalid refresh response');
      }
      store.dispatch(updateTokens({ sessionId, accessToken, refreshToken }));
    })
    .catch((failure) => {
      if (failure.response?.status === 401 && store.getState().loginSlice.sessionId === sessionId) {
        store.dispatch(logout());
      }
      throw failure;
    })
    .finally(() => {
      if (pendingRefresh === job) {
        pendingRefresh = undefined;
      }
    });

  pendingRefresh = job;
  return job.promise;
};

jwtAxios.interceptors.response.use((response) => response, async (failure) => {
  const { config, response } = failure;
  if (!config?.authSession || config.signal?.aborted
    || response?.status !== 401 || response.data?.error !== 'ERROR_ACCESS_TOKEN') {
    throw failure;
  }

  const { member, sessionId } = store.getState().loginSlice;
  if (!member || sessionId !== config.authSession) {
    throw failure;
  }
  if (config.authRetried) {
    if (config.headers.get('Authorization') === `Bearer ${member.accessToken}`) {
      store.dispatch(logout());
    }
    throw failure;
  }

  config.authRetried = true;
  if (config.headers.get('Authorization') === `Bearer ${member.accessToken}`) {
    await refreshOnce(sessionId, member);
  }
  if (store.getState().loginSlice.sessionId !== sessionId || config.signal?.aborted) {
    throw failure;
  }
  return jwtAxios(config);
});

export default jwtAxios;
