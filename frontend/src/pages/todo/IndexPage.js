import { useCallback } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import BasicLayout from '../../layouts/BasicLayout';

const IndexPage = () => {
  const navigate = useNavigate();

  const handleClickList = useCallback(() => {
    navigate({ pathname: 'list' });
  }, [navigate]);

  const handleClickAdd = useCallback(() => {
    navigate({ pathname: 'add' });
  }, [navigate]);

  return (
    <BasicLayout>
      <div className="w-full flex m-2 p-2">
        <button
          type="button"
          className="text-xl m-1 p-2 w-20 font-extrabold text-center underline"
          onClick={handleClickList}
        >
          LIST
        </button>
        <button
          type="button"
          className="text-xl m-1 p-2 w-20 font-extrabold text-center underline"
          onClick={handleClickAdd}
        >
          ADD
        </button>
      </div>
      <div className="flex flex-wrap w-full">
        <Outlet />
      </div>
    </BasicLayout>
  );
};

export default IndexPage;
