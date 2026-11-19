import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

const BasicMenu = () => {
  const member = useSelector((state) => state.loginSlice.member);

  return (
    <nav id="navbar" className="flex bg-blue-300">
      <div className="w-4/5 bg-gray-500">
        <ul className="flex flex-wrap p-4 text-white font-bold">
          <li className="pr-6 text-2xl">
            <Link to="/">Main</Link>
          </li>
          <li className="pr-6 text-2xl">
            <Link to="/about">About</Link>
          </li>
          {member && (
            <>
              <li className="pr-6 text-2xl">
                <Link to="/todo/">Todo</Link>
              </li>
              <li className="pr-6 text-2xl">
                <Link to="/products/">Products</Link>
              </li>
            </>
          )}
        </ul>
      </div>
      <div className="w-1/5 flex flex-wrap items-center justify-end gap-x-3 bg-orange-300 p-4 font-medium">
        {member && <Link className="text-white text-sm" to="/member/modify">회원정보 수정</Link>}
        <Link className="text-white text-sm m-1 rounded"
          to={member ? '/member/logout' : '/member/login'}>
          {member ? 'Logout' : 'Login'}
        </Link>
      </div>
    </nav>
  );
};

export default BasicMenu;
