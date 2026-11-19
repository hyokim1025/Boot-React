import { Link, Outlet, useLocation } from 'react-router-dom';
import BasicLayout from '../../layouts/BasicLayout';

const IndexPage = () => {
  const { search } = useLocation();
  const menuClass = 'm-1 w-20 p-2 text-center text-xl font-extrabold underline';

  return (
    <BasicLayout>
      <div className="font-extrabold">Products Menus</div>
      <div className="m-2 flex w-full p-2">
        <Link className={menuClass} to={{ pathname: 'list', search }}>LIST</Link>
        <Link className={menuClass} to={{ pathname: 'add', search }}>ADD</Link>
      </div>
      <Outlet />
    </BasicLayout>
  );
};

export default IndexPage;
