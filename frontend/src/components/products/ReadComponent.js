import { getImageUrl } from '../../api/productsApi';
import useCustomCart from '../../hooks/useCustomCart';
import useCustomLogin from '../../hooks/useCustomLogin';
import useCustomMove from '../../hooks/useCustomMove';
import useProduct from '../../hooks/useProduct';
import FetchingModal from '../common/FetchingModal';

const ReadComponent = ({ pno }) => {
  const { product, error } = useProduct(pno);
  const { moveToList, moveToModify } = useCustomMove('/products');
  const { loginState } = useCustomLogin();
  const { cartItems, loaded, busy, changeCart } = useCustomCart();

  const handleClickAddCart = () => {
    const addedItem = cartItems.find((item) => item.pno === product.pno);
    if (addedItem && !window.confirm('이미 추가된 상품입니다. 추가하시겠습니까?')) {
      return;
    }
    changeCart({
      email: loginState.email,
      pno: product.pno,
      cino: addedItem?.cino,
      qty: (addedItem?.qty ?? 0) + 1,
    });
  };

  return (
    <div className="m-2 mt-10 border-2 border-sky-200 p-4">
      {!product && !error && <FetchingModal />}
      {error && <p role="alert">{error}</p>}
      {product && (
        <>
          <dl>
            {[
              ['PNO', product.pno],
              ['PNAME', product.pname],
              ['PRICE', product.price],
              ['PDESC', product.pdesc],
            ].map(([label, value]) => (
              <div className="mb-4 flex items-center" key={label}>
                <dt className="w-1/5 pr-3 text-right font-bold">{label}</dt>
                <dd className="w-4/5 break-words rounded-r border p-6 shadow-md">{value}</dd>
              </div>
            ))}
          </dl>
          <div className="flex flex-col items-center">
            {product.uploadFileNames.map((fileName, index) => (
              <img alt={`${product.pname} ${index + 1}`} key={fileName} className="w-1/2 p-4"
                src={getImageUrl(fileName)} />
            ))}
          </div>
        </>
      )}
      <div className="flex flex-wrap justify-end gap-4 p-4">
        {product && (
          <>
            <button type="button" className="w-32 rounded bg-green-500 p-4 text-xl text-white disabled:opacity-50"
              onClick={handleClickAddCart} disabled={!loaded || busy}>
              Add Cart
            </button>
            <button type="button" className="w-32 rounded bg-red-500 p-4 text-xl text-white"
              onClick={() => moveToModify(pno)}>
              Modify
            </button>
          </>
        )}
        <button type="button" className="w-32 rounded bg-blue-500 p-4 text-xl text-white"
          onClick={() => moveToList()}>
          List
        </button>
      </div>
    </div>
  );
};

export default ReadComponent;
