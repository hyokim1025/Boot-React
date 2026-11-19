import { createSearchParams, useLocation, useNavigate, useSearchParams } from 'react-router-dom';

const getNumber = (value, fallback, max) => {
  const number = Number(value);
  return Number.isInteger(number) && number >= 1 && number <= max ? number : fallback;
};

const useCustomMove = () => {
  const navigate = useNavigate();
  const { key: refresh } = useLocation();
  const [queryParams] = useSearchParams();

  const page = getNumber(queryParams.get('page'), 1, 2147483647);
  const size = getNumber(queryParams.get('size'), 10, 100);
  const search = createSearchParams({ page, size }).toString();

  const moveToList = ({ page: nextPage = page, size: nextSize = size } = {}) => {
    navigate({
      pathname: '/todo/list',
      search: createSearchParams({ page: nextPage, size: nextSize }).toString(),
    });
  };

  const moveToRead = (tno) => navigate({ pathname: `/todo/read/${tno}`, search });
  const moveToModify = (tno) => navigate({ pathname: `/todo/modify/${tno}`, search });

  return { page, size, refresh, moveToList, moveToRead, moveToModify };
};

export default useCustomMove;
