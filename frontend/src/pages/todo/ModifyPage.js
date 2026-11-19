import { useParams } from 'react-router-dom';
import ModifyComponent from '../../components/todo/ModifyComponent';

const ModifyPage = () => {
  const { tno } = useParams();

  return (
    <div className="p-4 w-full bg-white">
      <h1 className="text-3xl font-extrabold">Todo Modify Page</h1>
      <ModifyComponent key={tno} tno={tno} />
    </div>
  );
};

export default ModifyPage;
