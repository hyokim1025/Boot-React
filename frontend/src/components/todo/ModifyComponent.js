import { useEffect, useState } from 'react';
import { deleteOne, getOne, putOne } from '../../api/todoApi';
import useCustomMove from '../../hooks/useCustomMove';
import ResultModal from '../common/ResultModal';

const ModifyComponent = ({ tno }) => {
  const { moveToList, moveToRead } = useCustomMove();
  const [todo, setTodo] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    getOne(tno, controller.signal).then(setTodo).catch((failure) => {
      if (!controller.signal.aborted) {
        setError(failure.response?.status === 404 ? '할 일을 찾을 수 없습니다.' : '할 일을 불러오지 못했습니다.');
      }
    });

    return () => controller.abort();
  }, [tno]);

  const handleChange = ({ target: { name, value } }) => {
    setTodo((current) => ({ ...current, [name]: name === 'complete' ? value === 'Y' : value }));
  };

  const handleModify = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');

    try {
      await putOne({ ...todo, title: todo.title.trim(), dueDate: todo.dueDate || null });
      setResult('Modified');
    } catch {
      setError('할 일을 수정하지 못했습니다. 입력 내용과 API 서버를 확인하세요.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    setError('');

    try {
      await deleteOne(tno);
      setResult('Deleted');
    } catch {
      setError('할 일을 삭제하지 못했습니다. API 서버를 확인하세요.');
    } finally {
      setSaving(false);
    }
  };

  const closeModal = () => {
    if (result === 'Deleted') {
      moveToList();
    } else {
      moveToRead(tno);
    }
  };

  return (
    <form className="border-2 border-sky-200 mt-10 m-2 p-4" onSubmit={handleModify}>
      {error && <p role="alert" className="p-4 text-red-700">{error}</p>}
      {!todo && !error && <p role="status">Loading...</p>}
      {todo && (
        <>
          {[
            ['TNO', todo.tno],
            ['WRITER', todo.writer],
          ].map(([label, value]) => (
            <div className="mb-4 flex items-center" key={label}>
              <span className="w-1/5 pr-3 text-right font-bold">{label}</span>
              <span className="w-4/5 rounded-r border bg-gray-100 p-6 shadow-md">{value}</span>
            </div>
          ))}
          <label className="mb-4 flex items-center">
            <span className="w-1/5 pr-3 text-right font-bold">TITLE</span>
            <input className="w-4/5 rounded-r border border-neutral-300 p-6 shadow-md"
              name="title" type="text" value={todo.title ?? ''} onChange={handleChange} maxLength={255} required />
          </label>
          <label className="mb-4 flex items-center">
            <span className="w-1/5 pr-3 text-right font-bold">DUEDATE</span>
            <input className="w-4/5 rounded-r border border-neutral-300 p-6 shadow-md"
              name="dueDate" type="date" value={todo.dueDate ?? ''} onChange={handleChange} />
          </label>
          <div className="mb-4 flex items-center">
            <label htmlFor="todo-complete" className="w-1/5 pr-3 text-right font-bold">COMPLETE</label>
            <select id="todo-complete" name="complete" className="m-1 rounded border-2 p-2"
              value={todo.complete ? 'Y' : 'N'} onChange={handleChange}>
              <option value="Y">Completed</option>
              <option value="N">Not Yet</option>
            </select>
          </div>
          <div className="flex justify-end p-4">
            <button type="button" disabled={saving || Boolean(result)} onClick={handleDelete}
              className="m-2 w-32 rounded bg-red-500 p-4 text-xl text-white disabled:opacity-50">
              Delete
            </button>
            <button type="submit" disabled={saving || Boolean(result)}
              className="m-2 w-32 rounded bg-blue-500 p-4 text-xl text-white disabled:opacity-50">
              Modify
            </button>
          </div>
        </>
      )}
      {result && <ResultModal title="처리결과" content={result} callbackFn={closeModal} />}
    </form>
  );
};

export default ModifyComponent;
