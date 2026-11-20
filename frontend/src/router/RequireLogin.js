import { useRecoilValue } from 'recoil';
import { Navigate, useLocation } from 'react-router-dom';
import signinState from '../atoms/signinState';

const RequireLogin = ({ children }) => {
  const { member } = useRecoilValue(signinState);
  const { pathname, search } = useLocation();

  return member ? children : (
    <Navigate to="/member/login" replace state={{ from: pathname + search }} />
  );
};

export default RequireLogin;
