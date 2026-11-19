import { useEffect, useRef } from 'react';

const ResultModal = ({ title, content, callbackFn }) => {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    dialog.showModal();
    return () => dialog.close();
  }, []);

  return (
    <dialog ref={dialogRef} aria-label={title} onCancel={callbackFn}
      className="w-[calc(100%-2rem)] max-w-[600px] rounded bg-white px-6 shadow backdrop:bg-black/20">
      <div className="my-6 border-b-4 border-gray-500 text-2xl">{title}</div>
      <div className="border-b-4 border-orange-400 py-4 text-4xl">{content}</div>
      <div className="flex justify-end">
        <button type="button" className="my-4 rounded bg-blue-500 px-6 py-4 text-lg text-white"
          onClick={callbackFn}>
          Close Modal
        </button>
      </div>
    </dialog>
  );
};

export default ResultModal;
