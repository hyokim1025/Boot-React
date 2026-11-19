import { useEffect, useState } from 'react';
import { getOne } from '../api/productsApi';

const useProduct = (pno) => {
  const [product, setProduct] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    getOne(pno, controller.signal).then(setProduct).catch((failure) => {
      if (!controller.signal.aborted) {
        setError(failure.response?.status === 404 ? '상품을 찾을 수 없습니다.' : '상품을 불러오지 못했습니다.');
      }
    });

    return () => controller.abort();
  }, [pno]);

  return { product, error };
};

export default useProduct;
