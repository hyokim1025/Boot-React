import { createAsyncThunk, createSlice, nanoid } from '@reduxjs/toolkit';
import { loginPost } from '../api/memberApi';
import { loadMemberCookie } from '../util/cookieUtil';

const initialState = { member: null, sessionId: null, status: 'idle', error: '', pendingId: null };

const memberInfo = (data) => {
  if (!data || !data.email || !data.accessToken || !data.refreshToken) {
    return null;
  }

  const { email, nickname, social, roleNames, accessToken, refreshToken } = data;
  return { email, nickname, social, roleNames, accessToken, refreshToken };
};

export const loginPostAsync = createAsyncThunk('login/post', async (credentials, { signal, rejectWithValue }) => {
  try {
    const member = memberInfo(await loginPost(credentials, signal));
    return member ?? rejectWithValue('로그인 응답을 확인하지 못했습니다.');
  } catch (failure) {
    return rejectWithValue(failure.response?.status === 401
      ? '이메일과 비밀번호를 확인하세요.'
      : '로그인 서버에 연결하지 못했습니다.');
  }
});

const loginSlice = createSlice({
  name: 'loginSlice',
  initialState: () => {
    const member = memberInfo(loadMemberCookie());
    return { ...initialState, member, sessionId: member ? nanoid() : null };
  },
  reducers: {
    login: {
      prepare: (data) => ({ payload: { member: memberInfo(data), sessionId: nanoid() } }),
      reducer: (state, { payload }) => payload.member ? { ...initialState, ...payload } : state,
    },
    logout: () => initialState,
    updateTokens: (state, { payload: { sessionId, accessToken, refreshToken } }) => {
      if (state.member && state.sessionId === sessionId) {
        state.member.accessToken = accessToken;
        state.member.refreshToken = refreshToken;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginPostAsync.pending, (state, { meta }) => {
        state.status = 'loading';
        state.error = '';
        state.pendingId = meta.requestId;
      })
      .addCase(loginPostAsync.fulfilled, (state, { payload, meta }) => {
        if (state.pendingId === meta.requestId) {
          return { ...initialState, member: payload, sessionId: meta.requestId };
        }
      })
      .addCase(loginPostAsync.rejected, (state, { payload, meta }) => {
        if (state.pendingId === meta.requestId) {
          state.status = 'idle';
          state.error = payload ?? '로그인하지 못했습니다.';
          state.pendingId = null;
        }
      });
  },
});

export const { login, logout, updateTokens } = loginSlice.actions;
export default loginSlice.reducer;
