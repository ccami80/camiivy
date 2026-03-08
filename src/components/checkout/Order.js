'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSelector, useDispatch } from 'react-redux';
import { setCartItems, setOrderItems, setLastOrder } from '@/redux/reducers/cartReducer';
import AddressForm from './AddressForm';
import PaymentMethod from './PaymentMethod';
import OrderSummary from './OrderSummary';
import CouponPointSection from './CouponPointSection';

const SHIPPING_FREE_THRESHOLD = 50000;
const SHIPPING_FEE = 3000;

function formatPrice(n) {
  return new Intl.NumberFormat('ko-KR').format(n) + '원';
}

function getTotal(items) {
  const productTotal = (items || []).reduce((sum, i) => sum + (i.price || 0) * (i.quantity || 1), 0);
  const shipping = productTotal >= SHIPPING_FREE_THRESHOLD ? 0 : SHIPPING_FEE;
  return productTotal + shipping;
}

export default function Order() {
  const router = useRouter();
  const orderItems = useSelector((state) => state.cart.orderItems);
  const cartItems = useSelector((state) => state.cart.cartItems);
  const dispatch = useDispatch();
  // TODO: 배송 정보는 주문 API 연동 시 서버로 전달 필요. 현재는 로컬 상태만 사용
  const [address, setAddress] = useState({ name: '', phone: '', zipCode: '', address: '', addressDetail: '' });
  const [payment, setPayment] = useState('card');

  useEffect(() => {
    if (orderItems.length === 0) {
      router.replace('/cart');
    }
  }, [orderItems.length, router]);

  // TODO: 실제 주문/결제 API 호출 없음. 주문 생성 API + PG 결제 연동 후 구현.
  const handlePlaceOrder = () => {
    // TODO: 주문 번호는 더미. 서버에서 발급한 orderId로 교체 필요.
    const orderId = 'ORD-' + Date.now();
    const totalAmount = getTotal(orderItems);
    dispatch(setLastOrder({
      orderId,
      items: orderItems,
      totalAmount,
    }));
    dispatch(setCartItems(cartItems.filter((x) => !orderItems.some((o) => o.id === x.id))));
    dispatch(setOrderItems([]));
    router.push('/order/complete');
  };

  if (orderItems.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 py-12 text-center">
        <p className="text-sm text-gray-600">No items to order.</p>
        <Link href="/cart" className="mt-4 inline-block text-sm font-medium text-gray-700 hover:text-gray-900">
          Back to cart
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 md:py-12">
      <h1 className="text-xl font-semibold text-gray-900">Checkout</h1>
      <Link href="/cart" className="mt-1 block text-sm text-gray-500 hover:text-gray-800">
        ← Edit cart
      </Link>

      <div className="mt-8 space-y-6">
        <AddressForm value={address} onChange={setAddress} />

        <div className="rounded-lg border border-gray-100 bg-white p-5">
          <h3 className="text-sm font-medium text-gray-800">Order summary</h3>
          <ul className="mt-4 space-y-3">
            {orderItems.map((i) => (
              <li key={i.id} className="flex justify-between text-sm">
                <span className="text-gray-700">
                  {i.name}
                  {i.option && ` (${i.option})`} × {i.quantity}
                </span>
                <span className="font-medium text-gray-800">
                  {formatPrice((i.price || 0) * (i.quantity || 1))}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <CouponPointSection />

        <PaymentMethod value={payment} onChange={setPayment} />

        <OrderSummary items={orderItems} showShipping />

        <button
          type="button"
          onClick={handlePlaceOrder}
          className="w-full rounded-md border border-gray-800 bg-gray-800 py-3 text-sm font-medium text-white hover:bg-gray-700"
        >
          Place order
        </button>
      </div>
    </div>
  );
}
