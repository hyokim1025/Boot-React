import { useCallback, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { loginPost } from '../api/memberApi';
import signinState, { endSession, startSession } from '../atoms/signinState';

const exceptionHandle = (failure, fallback) => {
  if (failure.response?.status === 403) {
    return '이 메뉴를 사용할 권한이 없습니다.';
  }
  if (failure.response?.status === 401) {
    return '로그인 정보를 확인하세요.';
  }
  return fallback;
};

const useCustomLogin = () => {
  const { member, sessionId } = useRecoilValue(signinState);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  const doLogin = useCallback(async (credentials) => {
    setStatus('loading');
    setError('');
    try {
      return startSession(await loginPost(credentials));
    } catch (failure) {
      setError(failure.response?.status === 401
        ? '이메일과 비밀번호를 확인하세요.'
        : '로그인 서버에 연결하지 못했습니다.');
      throw failure;
    } finally {
      setStatus('idle');
    }
  }, []);

  return { loginState: member, sessionId, isLogin: Boolean(member), status, error,
    doLogin, doLogout: endSession, exceptionHandle };
};

export default useCustomLogin;
