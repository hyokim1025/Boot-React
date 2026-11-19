import { useParams } from 'react-router-dom';
import ReadComponent from '../../components/todo/ReadComponent';

const ReadPage = () => {
  const { tno } = useParams();

  return (
    <div className="w-full bg-white mt-6">
      <h1 className="text-2xl font-extrabold">Todo Read Page Component {tno}</h1>
      <ReadComponent key={tno} tno={tno} />
    </div>
  );
};

export default ReadPage;
