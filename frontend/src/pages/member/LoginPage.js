import { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import BasicMenu from '../../components/menus/BasicMenu';
import useCustomLogin from '../../hooks/useCustomLogin';

const LoginPage = () => {
  const { isLogin, status, error, doLogin } = useCustomLogin();
  const { state } = useLocation();
  const [credentials, setCredentials] = useState({ email: '', pw: '' });
  const from = typeof state?.from === 'string' && /^\/(todo|products)(?:[/?]|$)/.test(state.from)
    ? state.from : '/';

  const handleChange = ({ target: { name, value } }) => {
    setCredentials((current) => ({ ...current, [name]: value }));
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    try {
      await doLogin(credentials);
    } catch {
      setCredentials((current) => ({ ...current, pw: '' }));
    }
  };

  if (isLogin) {
    return <Navigate to={from} replace />;
  }

  return (
    <>
      <BasicMenu />
      <main className="flex min-h-[70vh] items-center justify-center p-4">
        <form className="w-full max-w-md border-2 border-sky-200 p-4" onSubmit={handleLogin}>
          <h1 className="m-4 text-center text-4xl font-extrabold text-blue-500">Login Component</h1>
          {state?.from && <p className="mb-3 text-center">로그인 후 이용할 수 있습니다.</p>}
          <label className="mb-4 block font-bold">
            <span className="block p-3">Email</span>
            <input className="w-full rounded-r border border-neutral-500 p-3 font-normal shadow-md"
              type="email" name="email" autoComplete="username" value={credentials.email}
              onChange={handleChange} required />
          </label>
          <label className="mb-4 block font-bold">
            <span className="block p-3">Password</span>
            <input className="w-full rounded-r border border-neutral-500 p-3 font-normal shadow-md"
              type="password" name="pw" autoComplete="current-password" value={credentials.pw}
              onChange={handleChange} required />
          </label>
          {error && <p className="text-center text-red-700" role="alert">{error}</p>}
          <div className="flex justify-center p-6">
            <button type="submit" className="w-36 rounded bg-blue-500 p-4 text-xl text-white disabled:opacity-50"
              disabled={status === 'loading'}>
              LOGIN
            </button>
          </div>
        </form>
      </main>
    </>
  );
};

export default LoginPage;
