import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useCustomLogin from '../../hooks/useCustomLogin';
import jwtAxios from '../../util/jwtUtil';
import ResultModal from '../common/ResultModal';

const rowClass = 'mb-4 flex flex-wrap items-center';
const labelClass = 'w-full px-4 py-2 font-bold sm:w-1/5 sm:text-right';
const inputClass = 'w-full rounded-r border border-neutral-300 p-4 shadow-md sm:w-4/5';

const ModifyComponent = () => {
  const { loginState: member, doLogout } = useCustomLogin();
  const navigate = useNavigate();
  const [details, setDetails] = useState({ nickname: member.nickname ?? '', pw: '', currentPassword: '' });
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState(false);
  const [error, setError] = useState('');

  const handleChange = ({ target: { name, value } }) => {
    setDetails((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      await jwtAxios.put('/api/member/modify', { ...details, nickname: details.nickname.trim() });
      setResult(true);
    } catch (failure) {
      if (failure.response?.status === 403) {
        setError('현재 비밀번호를 확인하세요.');
      } else if (failure.response?.status === 400) {
        setError('닉네임을 입력하고 새 비밀번호는 8자 이상으로 설정하세요.');
      } else {
        setError('회원정보를 수정하지 못했습니다.');
      }
    } finally {
      setSaving(false);
    }
  };

  const closeModal = () => {
    doLogout();
    navigate('/member/login', { replace: true });
  };

  return (
    <form className="mt-6" onSubmit={handleSubmit}>
      {result && <ResultModal title="회원정보" content="정보수정완료" callbackFn={closeModal} />}
      <label className={rowClass}>
        <span className={labelClass}>Email</span>
        <input className={inputClass} name="email" type="email" value={member.email} readOnly />
      </label>
      <label className={rowClass}>
        <span className={labelClass}>Password</span>
        <input className={inputClass} name="pw" type="password" autoComplete="new-password"
          minLength={8} maxLength={72} value={details.pw} onChange={handleChange} required={member.social} />
      </label>
      {!member.social && details.pw.trim() && (
        <label className={rowClass}>
          <span className={labelClass}>Current Password</span>
          <input className={inputClass} name="currentPassword" type="password" autoComplete="current-password"
            maxLength={72} value={details.currentPassword} onChange={handleChange} required />
        </label>
      )}
      <label className={rowClass}>
        <span className={labelClass}>Nickname</span>
        <input className={inputClass} name="nickname" value={details.nickname} onChange={handleChange}
          maxLength={80} required />
      </label>
      {error && <p className="text-center text-red-700" role="alert">{error}</p>}
      <div className="mb-4 flex justify-end">
        <button className="m-2 w-32 rounded bg-blue-500 p-4 text-xl text-white disabled:opacity-50"
          type="submit" disabled={saving || result}>
          Modify
        </button>
      </div>
    </form>
  );
};

export default ModifyComponent;
