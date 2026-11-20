import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { deleteOne, getImageUrl, postAdd, productDetailKey, productListKey, putOne } from '../../api/productsApi';
import { cartKey } from '../../atoms/cartState';
import { getSession } from '../../atoms/signinState';
import useCustomLogin from '../../hooks/useCustomLogin';
import useCustomMove from '../../hooks/useCustomMove';
import FetchingModal from '../common/FetchingModal';
import ResultModal from '../common/ResultModal';

const labelClass = 'w-full font-bold sm:w-1/5 sm:pr-3 sm:text-right';
const inputClass = 'w-full min-w-0 rounded-r border border-neutral-300 p-4 shadow-md sm:w-4/5 sm:p-6';

const ProductForm = ({ product }) => {
  const pno = product?.pno;
  const { moveToList, moveToRead } = useCustomMove('/products');
  const { sessionId } = useCustomLogin();
  const queryClient = useQueryClient();
  const { mutateAsync, isPending: fetching } = useMutation({
    mutationFn: ({ formData, remove }) => {
      if (remove) return deleteOne(pno, sessionId);
      return pno ? putOne(pno, formData, sessionId) : postAdd(formData, sessionId);
    },
    onSuccess: (_, { remove }) => {
      if (getSession().sessionId !== sessionId) return;
      const invalidations = [queryClient.invalidateQueries({ queryKey: productListKey(sessionId) })];
      if (pno) {
        invalidations.push(queryClient.invalidateQueries({
          queryKey: productDetailKey(sessionId, pno),
          refetchType: remove ? 'none' : 'active',
        }));
        invalidations.push(queryClient.invalidateQueries({ queryKey: cartKey(sessionId) }));
      }
      return Promise.all(invalidations);
    },
  });
  const [details, setDetails] = useState({
    pname: product?.pname ?? '',
    pdesc: product?.pdesc ?? '',
    price: product?.price ?? 0,
  });
  const [retainedFiles, setRetainedFiles] = useState(product?.uploadFileNames ?? []);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const uploadRef = useRef(null);

  useEffect(() => {
    const images = selectedFiles.map((file) => ({ name: file.name, url: URL.createObjectURL(file) }));
    setPreviews(images);
    return () => images.forEach(({ url }) => URL.revokeObjectURL(url));
  }, [selectedFiles]);

  const changeDetails = ({ target: { name, value } }) => {
    setDetails((current) => ({ ...current, [name]: value }));
  };

  const saveProduct = async (event) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append('pname', details.pname.trim());
    formData.append('pdesc', details.pdesc);
    formData.append('price', details.price);
    for (const name of retainedFiles) {
      formData.append('uploadFileNames', name);
    }
    for (const file of uploadRef.current.files) {
      formData.append('files', file);
    }

    setError('');
    try {
      const { result: id } = await mutateAsync({ formData });
      if (pno) {
        setResult({ content: 'Modified', next: 'read' });
      } else {
        setResult({ content: `${id}번 등록 완료`, next: 'list' });
      }
    } catch (failure) {
      if (failure.response?.status === 415) {
        setError('JPG, PNG 또는 GIF 이미지 파일을 선택하세요.');
      } else if (failure.response?.status === 413) {
        setError('이미지는 장당 10MB, 요청 전체는 30MB까지 올릴 수 있습니다.');
      } else {
        setError('상품을 저장하지 못했습니다. 입력값과 API 서버를 확인하세요.');
      }
    }
  };

  const removeProduct = async () => {
    setError('');
    try {
      await mutateAsync({ remove: true });
      setResult({ content: 'Deleted', next: 'list' });
    } catch {
      setError('상품을 삭제하지 못했습니다.');
    }
  };

  const closeModal = () => {
    if (result.next === 'read') {
      moveToRead(pno);
    } else {
      if (pno) queryClient.removeQueries({ queryKey: productDetailKey(sessionId, pno) });
      moveToList({ page: 1 });
    }
  };

  return (
    <form className="m-2 mt-10 border-2 border-sky-200 p-4" onSubmit={saveProduct}>
      {fetching && <FetchingModal />}
      {error && <p role="alert" className="mb-4 text-red-700">{error}</p>}
      <fieldset disabled={fetching || Boolean(result)}>
        {pno && (
          <div className="mb-4 flex flex-wrap items-center">
            <span className={labelClass}>PNO</span>
            <span className={`${inputClass} bg-gray-100`}>{pno}</span>
          </div>
        )}
        <label className="mb-4 flex flex-wrap items-center">
          <span className={labelClass}>Product Name</span>
          <input className={inputClass} name="pname" value={details.pname}
            onChange={changeDetails} required maxLength={255} />
        </label>
        <label className="mb-4 flex flex-wrap items-center">
          <span className={labelClass}>Desc</span>
          <textarea className={inputClass} name="pdesc" value={details.pdesc}
            onChange={changeDetails} rows={4} maxLength={255} />
        </label>
        <label className="mb-4 flex flex-wrap items-center">
          <span className={labelClass}>Price</span>
          <input className={inputClass} name="price" type="number" min={0} max={2147483647}
            value={details.price} onChange={changeDetails} required />
        </label>
        <label className="mb-4 flex flex-wrap items-center">
          <span className={labelClass}>Files</span>
          <input className={inputClass} ref={uploadRef} type="file" multiple
            accept="image/jpeg,image/png,image/gif"
            onChange={(event) => setSelectedFiles(Array.from(event.target.files))} />
        </label>
        {(retainedFiles.length > 0 || previews.length > 0) && (
          <div className="mb-4 flex flex-wrap">
            <span className={labelClass}>Images</span>
            <div className="grid w-full grid-cols-2 gap-4 sm:w-4/5 sm:grid-cols-3">
              {retainedFiles.map((name, index) => (
                <div key={name}>
                  <button type="button" className="w-full bg-blue-500 p-2 text-white"
                    aria-label={`Delete image ${index + 1}`}
                    onClick={() => setRetainedFiles((current) => current.filter((file) => file !== name))}>
                    DELETE
                  </button>
                  <img alt={`Existing product image ${index + 1}`} src={getImageUrl(name, true)} />
                </div>
              ))}
              {previews.map(({ name, url }) => <img alt={name} key={url} src={url} />)}
            </div>
          </div>
        )}
        <div className="flex flex-wrap justify-end gap-4 p-4">
          {pno && (
            <button type="button" className="w-32 rounded bg-red-500 p-4 text-xl text-white"
              onClick={removeProduct}>
              Delete
            </button>
          )}
          <button type="submit" className={`w-32 rounded p-4 text-xl text-white ${pno ? 'bg-orange-500' : 'bg-blue-500'}`}>
            {pno ? 'Modify' : 'ADD'}
          </button>
          {pno && (
            <button type="button" className="w-32 rounded bg-blue-500 p-4 text-xl text-white"
              onClick={() => moveToList()}>
              List
            </button>
          )}
        </div>
      </fieldset>
      {result && (
        <ResultModal title={pno ? '처리결과' : 'Product Add Result'} content={result.content}
          callbackFn={closeModal} />
      )}
    </form>
  );
};

export default ProductForm;
