import { Suspense, lazy } from 'react';
import RequireLogin from './RequireLogin';

const LoginPage = lazy(() => import('../pages/member/LoginPage'));
const LogoutPage = lazy(() => import('../pages/member/LogoutPage'));
const KakaoRedirectPage = lazy(() => import('../pages/member/KakaoRedirectPage'));
const ModifyPage = lazy(() => import('../pages/member/ModifyPage'));
const loading = <div>Loading....</div>;

const memberRouter = () => [
  { path: 'login', element: <Suspense fallback={loading}><LoginPage /></Suspense> },
  { path: 'logout', element: <Suspense fallback={loading}><LogoutPage /></Suspense> },
  { path: 'kakao', element: <Suspense fallback={loading}><KakaoRedirectPage /></Suspense> },
  {
    path: 'modify',
    element: <RequireLogin><Suspense fallback={loading}><ModifyPage /></Suspense></RequireLogin>,
  },
];

export default memberRouter;
