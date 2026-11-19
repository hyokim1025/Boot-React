import { useParams } from 'react-router-dom';
import FetchingModal from '../../components/common/FetchingModal';
import ProductForm from '../../components/products/ProductForm';
import useCustomMove from '../../hooks/useCustomMove';
import useProduct from '../../hooks/useProduct';

const ModifyProduct = ({ pno }) => {
  const { product, error } = useProduct(pno);
  const { moveToList } = useCustomMove('/products');

  if (error) {
    return (
      <div className="mt-10 border-2 border-sky-200 p-4">
        <p role="alert">{error}</p>
        <button type="button" className="mt-4 rounded bg-blue-500 p-4 text-white"
          onClick={() => moveToList()}>
          List
        </button>
      </div>
    );
  }

  return product ? <ProductForm product={product} /> : <FetchingModal />;
};

const ModifyPage = () => {
  const { pno } = useParams();

  return (
    <div className="w-full bg-white p-4">
      <h1 className="text-3xl font-extrabold">Products Modify Page</h1>
      <ModifyProduct key={pno} pno={pno} />
    </div>
  );
};

export default ModifyPage;
