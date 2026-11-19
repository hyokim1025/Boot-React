import { Navigate } from 'react-router-dom';
import BasicMenu from '../../components/menus/BasicMenu';
import useCustomLogin from '../../hooks/useCustomLogin';

const LogoutPage = () => {
  const { isLogin, doLogout } = useCustomLogin();

  if (!isLogin) {
    return <Navigate to="/" replace />;
  }

  return (
    <>
      <BasicMenu />
      <main className="flex min-h-[70vh] items-center justify-center p-4">
        <div className="w-full max-w-md border-2 border-red-200 p-4 text-center">
          <h1 className="m-4 text-4xl font-extrabold text-red-500">Logout Component</h1>
          <button type="button" onClick={doLogout} className="m-6 w-36 rounded bg-red-500 p-4 text-xl text-white">
            LOGOUT
          </button>
        </div>
      </main>
    </>
  );
};

export default LogoutPage;
