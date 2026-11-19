import { useParams } from 'react-router-dom';
import { getImageUrl } from '../../api/productsApi';
import FetchingModal from '../../components/common/FetchingModal';
import useCustomMove from '../../hooks/useCustomMove';
import useProduct from '../../hooks/useProduct';

const ReadProduct = ({ pno }) => {
  const { product, error } = useProduct(pno);
  const { moveToList, moveToModify } = useCustomMove('/products');

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
          <button type="button" className="w-32 rounded bg-red-500 p-4 text-xl text-white"
            onClick={() => moveToModify(pno)}>
            Modify
          </button>
        )}
        <button type="button" className="w-32 rounded bg-blue-500 p-4 text-xl text-white"
          onClick={() => moveToList()}>
          List
        </button>
      </div>
    </div>
  );
};

const ReadPage = () => {
  const { pno } = useParams();

  return (
    <div className="w-full bg-white p-4">
      <h1 className="text-3xl font-extrabold">Products Read Page</h1>
      <ReadProduct key={pno} pno={pno} />
    </div>
  );
};

export default ReadPage;
