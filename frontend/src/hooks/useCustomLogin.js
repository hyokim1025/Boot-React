import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginPostAsync, logout } from '../slices/loginSlice';

const useCustomLogin = () => {
  const dispatch = useDispatch();
  const { member, status, error } = useSelector((state) => state.loginSlice);
  const doLogin = (credentials) => dispatch(loginPostAsync(credentials)).unwrap();
  const doLogout = () => dispatch(logout());
  const exceptionHandle = useCallback((failure, fallback) => {
    if (failure.response?.status === 403) {
      return '이 메뉴를 사용할 권한이 없습니다.';
    }
    if (failure.response?.status === 401) {
      return '로그인 정보를 확인하세요.';
    }
    return fallback;
  }, []);

  return { loginState: member, isLogin: Boolean(member), status, error, doLogin, doLogout, exceptionHandle };
};

export default useCustomLogin;
