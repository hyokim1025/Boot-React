import { useParams } from 'react-router-dom';
import ReadComponent from '../../components/products/ReadComponent';

const ReadPage = () => {
  const { pno } = useParams();

  return (
    <div className="w-full bg-white p-4">
      <h1 className="text-3xl font-extrabold">Products Read Page</h1>
      <ReadComponent key={pno} pno={pno} />
    </div>
  );
};

export default ReadPage;
