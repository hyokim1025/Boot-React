import { useCallback } from 'react';
import { createSearchParams, useNavigate, useParams, useSearchParams } from 'react-router-dom';

const ReadPage = () => {
  const { tno } = useParams();
  const navigate = useNavigate();
  const [queryParams] = useSearchParams();
  const page = queryParams.get('page') ? parseInt(queryParams.get('page'), 10) : 1;
  const size = queryParams.get('size') ? parseInt(queryParams.get('size'), 10) : 10;
  const queryStr = createSearchParams({ page: String(page), size: String(size) }).toString();

  const moveToModify = useCallback(() => {
    navigate({ pathname: `/todo/modify/${tno}`, search: queryStr });
  }, [navigate, tno, queryStr]);

  const moveToList = useCallback(() => {
    navigate({ pathname: '/todo/list', search: queryStr });
  }, [navigate, queryStr]);

  return (
    <div className="text-3xl font-extrabold">
      Todo Read Page Component {tno}
      <div>
        <button type="button" onClick={moveToModify}>Test Modify</button>
        <button type="button" onClick={moveToList}>Test List</button>
      </div>
    </div>
  );
};

export default ReadPage;
