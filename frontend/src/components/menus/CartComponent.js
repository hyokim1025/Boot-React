import { useRecoilValue } from 'recoil';
import { cartTotalState } from '../../atoms/cartState';
import useCustomCart from '../../hooks/useCustomCart';
import useCustomLogin from '../../hooks/useCustomLogin';
import CartItemComponent from '../cart/CartItemComponent';

const CartComponent = () => {
  const { isLogin, loginState } = useCustomLogin();
  const { cartItems, loaded, busy, error, refreshCart, changeCart } = useCustomCart();
  const total = useRecoilValue(cartTotalState);

  if (!isLogin) return null;

  return (
    <section className="w-full min-w-0" aria-label="장바구니">
      <div className="flex items-start justify-between gap-2">
        <h2 className="min-w-0 break-words text-2xl font-extrabold">{loginState.nickname}'s Cart</h2>
        <span className="rounded-full bg-orange-600 px-3 text-center font-bold text-white">{cartItems.length}</span>
      </div>
      {!loaded && busy && <p role="status" className="mt-2">장바구니 불러오는 중</p>}
      {error && (
        <div className="my-2">
          <p role="alert" className="text-red-800">{error}</p>
          <button type="button" className="underline" disabled={busy} onClick={refreshCart}>다시 불러오기</button>
        </div>
      )}
      <ul className="mt-2 space-y-2">
        {cartItems.map((item) => (
          <CartItemComponent key={item.cino} item={item} busy={busy}
            onChangeQty={(qty) => changeCart({ email: loginState.email, cino: item.cino, pno: item.pno, qty })} />
        ))}
      </ul>
      <div className="mt-2 text-right text-2xl font-extrabold">TOTAL: {total}</div>
    </section>
  );
};

export default CartComponent;
