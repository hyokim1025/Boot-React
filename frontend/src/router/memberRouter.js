import { Suspense, lazy } from 'react';

const LoginPage = lazy(() => import('../pages/member/LoginPage'));
const LogoutPage = lazy(() => import('../pages/member/LogoutPage'));
const loading = <div>Loading....</div>;

const memberRouter = () => [
  { path: 'login', element: <Suspense fallback={loading}><LoginPage /></Suspense> },
  { path: 'logout', element: <Suspense fallback={loading}><LogoutPage /></Suspense> },
];

export default memberRouter;
