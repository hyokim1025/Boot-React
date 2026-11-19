import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';

const RequireLogin = ({ children }) => {
  const member = useSelector((state) => state.loginSlice.member);
  const { pathname, search } = useLocation();

  return member ? children : (
    <Navigate to="/member/login" replace state={{ from: pathname + search }} />
  );
};

export default RequireLogin;
