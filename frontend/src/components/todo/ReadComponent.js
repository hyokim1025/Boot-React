import { useEffect, useState } from 'react';
import { getOne } from '../../api/todoApi';
import useCustomMove from '../../hooks/useCustomMove';

const ReadComponent = ({ tno }) => {
  const { moveToList, moveToModify } = useCustomMove();
  const [todo, setTodo] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    getOne(tno, controller.signal).then(setTodo).catch((failure) => {
      if (!controller.signal.aborted) {
        setError(failure.response?.status === 404 ? '할 일을 찾을 수 없습니다.' : '할 일을 불러오지 못했습니다.');
      }
    });

    return () => controller.abort();
  }, [tno]);

  return (
    <div className="border-2 border-sky-200 mt-10 m-2 p-4">
      {error && <p role="alert">{error}</p>}
      {!error && !todo && <p role="status">Loading...</p>}
      {todo && (
        <dl>
          {[
            ['Tno', todo.tno],
            ['Writer', todo.writer],
            ['Title', todo.title],
            ['Due Date', todo.dueDate],
            ['Complete', todo.complete ? 'Completed' : 'Not Yet'],
          ].map(([label, value]) => (
            <div className="mb-4 flex items-center" key={label}>
              <dt className="w-1/5 pr-3 text-right font-bold">{label}</dt>
              <dd className="w-4/5 break-words rounded-r border p-6 shadow-md">{value}</dd>
            </div>
          ))}
        </dl>
      )}
      <div className="flex justify-end p-4">
        <button type="button" className="m-2 w-32 rounded bg-blue-500 p-4 text-xl text-white"
          onClick={() => moveToList()}>
          List
        </button>
        {todo && (
          <button type="button" className="m-2 w-32 rounded bg-red-500 p-4 text-xl text-white"
            onClick={() => moveToModify(tno)}>
            Modify
          </button>
        )}
      </div>
    </div>
  );
};

export default ReadComponent;
