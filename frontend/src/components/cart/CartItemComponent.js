import { getImageUrl } from '../../api/productsApi';

const CartItemComponent = ({ item, busy, onChangeQty }) => {
  const { cino, pno, pname, price, qty, imageFile } = item;

  return (
    <li className="border-2 p-2 text-xl">
      {imageFile && (
        <img className="mx-auto mb-2 max-w-full" src={getImageUrl(imageFile, true)} alt={pname} />
      )}
      <div>Cart Item No: {cino}</div>
      <div>Pno: {pno}</div>
      <div className="break-words">Name: {pname}</div>
      <div>Price: {price}</div>
      <div className="flex flex-wrap items-center justify-between">
        <div>Qty: {qty}</div>
        <div className="flex gap-1">
          <button type="button" className="w-8 rounded-lg bg-orange-500 disabled:opacity-50"
            aria-label={`${pname} 수량 늘리기`} disabled={busy} onClick={() => onChangeQty(qty + 1)}>+</button>
          <button type="button" className="w-8 rounded-lg bg-orange-500 disabled:opacity-50"
            aria-label={`${pname} 수량 줄이기`} disabled={busy} onClick={() => onChangeQty(qty - 1)}>-</button>
        </div>
      </div>
      <div className="my-2 flex justify-center">
        <button type="button" className="w-8 rounded-lg bg-red-500 text-white disabled:opacity-50"
          aria-label={`${pname} 삭제`} disabled={busy} onClick={() => onChangeQty(0)}>X</button>
      </div>
      <div className="border-t-2 pr-2 text-right font-extrabold">{qty * price} 원</div>
    </li>
  );
};

export default CartItemComponent;
