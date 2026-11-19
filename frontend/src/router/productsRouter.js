import { Suspense, lazy } from 'react';
import { Navigate } from 'react-router-dom';

const Loading = <div>Loading....</div>;
const ListPage = lazy(() => import('../pages/products/ListPage'));
const AddPage = lazy(() => import('../pages/products/AddPage'));
const ReadPage = lazy(() => import('../pages/products/ReadPage'));
const ModifyPage = lazy(() => import('../pages/products/ModifyPage'));

const productsRouter = () => [
  { index: true, element: <Navigate replace to="list" /> },
  { path: 'list', element: <Suspense fallback={Loading}><ListPage /></Suspense> },
  { path: 'add', element: <Suspense fallback={Loading}><AddPage /></Suspense> },
  { path: 'read/:pno', element: <Suspense fallback={Loading}><ReadPage /></Suspense> },
  { path: 'modify/:pno', element: <Suspense fallback={Loading}><ModifyPage /></Suspense> },
];

export default productsRouter;
