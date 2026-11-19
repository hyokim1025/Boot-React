import { useEffect, useState } from 'react';
import { getList } from '../../api/todoApi';
import useCustomMove from '../../hooks/useCustomMove';
import PageComponent from '../common/PageComponent';

const ListComponent = () => {
  const { page, size, refresh, moveToList, moveToRead } = useCustomMove();
  const [serverData, setServerData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    setError('');

    getList({ page, size }, controller.signal)
      .then(setServerData)
      .catch(() => {
        if (!controller.signal.aborted) {
          setServerData(null);
          setError('할 일 목록을 불러오지 못했습니다. API 서버를 확인하세요.');
        }
      });

    return () => controller.abort();
  }, [page, size, refresh]);

  return (
    <div className="border-2 border-blue-100 mt-10 mx-2">
      <div className="flex flex-wrap justify-center p-6">
        {error && <p role="alert">{error}</p>}
        {!error && !serverData && <p role="status">Loading...</p>}
        {serverData?.dtoList.length === 0 && <p>등록된 할 일이 없습니다.</p>}
        {serverData?.dtoList.map((todo) => (
          <button type="button" key={todo.tno} className="m-2 w-full rounded p-2 text-left shadow-md"
            onClick={() => moveToRead(todo.tno)}>
            <span className="flex items-center">
              <span className="w-1/12 min-w-12 p-2 text-2xl font-extrabold">{todo.tno}</span>
              <span className="m-1 min-w-0 w-8/12 break-words p-2 font-extrabold">{todo.title}</span>
              <span className="m-1 shrink-0 p-2 font-medium">{todo.dueDate}</span>
            </span>
          </button>
        ))}
      </div>
      {serverData && <PageComponent serverData={serverData} movePage={moveToList} />}
    </div>
  );
};

export default ListComponent;
