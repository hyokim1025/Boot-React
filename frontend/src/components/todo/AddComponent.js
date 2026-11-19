import { useState } from 'react';
import { postAdd } from '../../api/todoApi';
import useCustomMove from '../../hooks/useCustomMove';
import ResultModal from '../common/ResultModal';

const fields = [
  { name: 'title', label: 'TITLE', type: 'text' },
  { name: 'writer', label: 'WRITER', type: 'text' },
  { name: 'dueDate', label: 'DUEDATE', type: 'date' },
];

const AddComponent = () => {
  const { moveToList } = useCustomMove();
  const [todo, setTodo] = useState({ title: '', writer: '', dueDate: '' });
  const [result, setResult] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleChange = ({ target: { name, value } }) => {
    setTodo((current) => ({ ...current, [name]: value }));
  };

  const handleAdd = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');

    try {
      const { TNO } = await postAdd({
        title: todo.title.trim(),
        writer: todo.writer.trim(),
        dueDate: todo.dueDate || null,
      });
      setResult(TNO);
    } catch {
      setError('할 일을 등록하지 못했습니다. 입력 내용과 API 서버를 확인하세요.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="border-2 border-sky-200 mt-10 m-2 p-4" onSubmit={handleAdd}>
      {fields.map(({ name, label, type }) => (
        <label className="mb-4 flex items-center" key={name}>
          <span className="w-1/5 pr-3 text-right font-bold">{label}</span>
          <input className="w-4/5 rounded-r border border-neutral-500 p-6 shadow-md"
            name={name} type={type} value={todo[name]} onChange={handleChange}
            required={name === 'title'} maxLength={type === 'text' ? 255 : undefined} />
        </label>
      ))}
      {error && <p role="alert" className="p-4 text-red-700">{error}</p>}
      <div className="flex justify-end p-4">
        <button type="submit" disabled={saving || result !== null}
          className="w-36 rounded bg-blue-500 p-4 text-xl text-white disabled:opacity-50">
          ADD
        </button>
      </div>
      {result !== null && (
        <ResultModal title="Add Result" content={`New ${result} Added`}
          callbackFn={() => moveToList({ page: 1 })} />
      )}
    </form>
  );
};

export default AddComponent;
