import { useState } from 'react';
import { startKakaoLogin } from '../../api/kakaoApi';

const KakaoLoginComponent = () => {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  const handleClick = async () => {
    setPending(true);
    setError('');
    try {
      window.location.assign(await startKakaoLogin());
    } catch (failure) {
      setError(failure.response?.status === 503
        ? '카카오 앱의 REST API 키와 Client Secret을 먼저 설정하세요.'
        : '카카오 로그인을 시작하지 못했습니다.');
      setPending(false);
    }
  };

  return (
    <div className="mb-4 flex flex-col items-center">
      <button type="button" onClick={handleClick} disabled={pending}
        className="w-3/4 rounded bg-yellow-500 p-2 text-2xl font-extrabold text-white shadow-sm disabled:opacity-50">
        KAKAO LOGIN
      </button>
      {error && <p className="mt-2 text-center text-red-700" role="alert">{error}</p>}
    </div>
  );
};

export default KakaoLoginComponent;
