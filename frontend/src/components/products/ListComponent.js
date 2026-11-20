import { useQuery } from '@tanstack/react-query';
import { getImageUrl, getList, productListKey } from '../../api/productsApi';
import useCustomLogin from '../../hooks/useCustomLogin';
import useCustomMove from '../../hooks/useCustomMove';
import FetchingModal from '../common/FetchingModal';
import PageComponent from '../common/PageComponent';

const ListComponent = () => {
  const { exceptionHandle, sessionId } = useCustomLogin();
  const { page, size, moveToList, moveToRead } = useCustomMove('/products');
  const { data: serverData, isPending, error } = useQuery({
    queryKey: [...productListKey(sessionId), page, size],
    queryFn: ({ signal }) => getList({ page, size }, { signal, sessionId }),
    enabled: Boolean(sessionId),
  });

  return (
    <div className="mx-2 mt-10 border-2 border-blue-100">
      {isPending && <FetchingModal />}
      {error && <p role="alert" className="p-6">{exceptionHandle(error, '상품 목록을 불러오지 못했습니다.')}</p>}
      {serverData?.dtoList.length === 0 && <p className="p-6">등록된 상품이 없습니다.</p>}
      {serverData?.dtoList.length > 0 && (
        <div className="grid grid-cols-2 p-6">
          {serverData.dtoList.map((product) => (
            <button type="button" key={product.pno}
              className="flex min-w-0 flex-col rounded border-2 p-1 text-left shadow-md"
              onClick={() => moveToRead(product.pno)}>
              <span className="p-2 text-2xl font-extrabold">{product.pno}</span>
              <span className="m-1 flex min-w-0 flex-col p-2">
                {product.uploadFileNames[0] && (
                  <img alt={product.pname} className="m-auto w-60 max-w-full rounded-md"
                    src={getImageUrl(product.uploadFileNames[0], true)} />
                )}
                <span className="break-words p-1 text-center font-extrabold">이름: {product.pname}</span>
                <span className="p-1 text-center font-extrabold">가격: {product.price}</span>
              </span>
            </button>
          ))}
        </div>
      )}
      {serverData && <PageComponent serverData={serverData} movePage={moveToList} ariaLabel="Product pages" />}
    </div>
  );
};

export default ListComponent;
