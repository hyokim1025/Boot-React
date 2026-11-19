import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { finishKakaoLogin } from '../../api/kakaoApi';
import { login } from '../../slices/loginSlice';

const loginErrors = {
  400: '카카오 로그인을 다시 시작하세요.',
  409: '이미 등록된 이메일입니다. 기존 계정으로 로그인하세요.',
  422: '카카오에서 인증된 이메일 제공에 동의해 주세요.',
  503: '카카오 앱의 REST API 키와 Client Secret을 먼저 설정하세요.',
};

const KakaoRedirectPage = () => {
  const [params] = useSearchParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const started = useRef(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const code = params.get('code');
    const state = params.get('state');
    window.history.replaceState(window.history.state, '', '/member/kakao');

    if (!code || !state) {
      setError('카카오 로그인이 취소되었거나 인가 코드를 받지 못했습니다.');
      return;
    }

    finishKakaoLogin(code, state)
      .then((member) => {
        dispatch(login(member));
        navigate(member.social ? '/member/modify' : '/', { replace: true });
      })
      .catch((failure) => {
        setError(loginErrors[failure.response?.status] ?? '카카오 로그인에 실패했습니다.');
      });
  }, [dispatch, navigate, params]);

  return (
    <main className="m-6 text-center">
      {error ? (
        <>
          <p role="alert">{error}</p>
          <Link className="mt-3 inline-block text-blue-600 underline" to="/member/login">로그인으로 이동</Link>
        </>
      ) : <p role="status">카카오 로그인 중입니다.</p>}
    </main>
  );
};

export default KakaoRedirectPage;
