import { useQuery } from '@tanstack/react-query';
import { useRecoilValue } from 'recoil';
import { getOne, productDetailKey } from '../api/productsApi';
import signinState from '../atoms/signinState';

const useProduct = (pno) => {
  const { sessionId } = useRecoilValue(signinState);
  const { data, error } = useQuery({
    queryKey: productDetailKey(sessionId, pno),
    queryFn: ({ signal }) => getOne(pno, { signal, sessionId }),
    enabled: Boolean(sessionId),
  });
  if (error?.response?.status === 404) {
    return { product: null, error: '상품을 찾을 수 없습니다.' };
  }
  return { product: data, error: !data && error ? '상품을 불러오지 못했습니다.' : '' };
};

export default useProduct;
