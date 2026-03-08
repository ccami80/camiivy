'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

const statusLabel = {
  PAYMENT_PENDING: '결제 대기',
  PAYMENT_COMPLETED: '결제 완료',
  CANCELLED: '취소',
};

export default function PaymentPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    fetch(`/api/orders/${id}`)
      .then((r) => {
        if (r.status === 404) throw new Error('주문을 찾을 수 없습니다.');
        return r.json();
      })
      .then(setOrder)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  function handlePay() {
    if (!order || order.status !== 'PAYMENT_PENDING') return;
    setPaying(true);
    setError('');
    fetch(`/api/orders/${id}/pay`, { method: 'POST', credentials: 'include' })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        router.push(`/orders/${id}/complete`);
      })
      .catch((err) => {
        setError(err.message || '결제 처리에 실패했습니다.');
      })
      .finally(() => setPaying(false));
  }

  function handleCancel() {
    if (!order || order.status !== 'PAYMENT_PENDING') return;
    if (!confirm('이 주문을 취소하시겠습니까?')) return;
    setCancelling(true);
    setError('');
    fetch(`/api/orders/${id}/cancel`, { method: 'POST', credentials: 'include' })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setOrder((prev) => (prev ? { ...prev, status: 'CANCELLED' } : null));
      })
      .catch((err) => setError(err.message || '취소 처리에 실패했습니다.'))
      .finally(() => setCancelling(false));
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <p className="text-gray-500">로딩 중…</p>
      </div>
    );
  }

  if (!order || error) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 text-center">
        <p className="text-gray-600">{error || '주문을 찾을 수 없습니다.'}</p>
        <Link href="/products" className="mt-4 inline-block text-sm font-medium text-gray-700 underline">
          상품 목록
        </Link>
      </div>
    );
  }

  const status = order?.status;
  if (status === 'PAYMENT_COMPLETED') {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 text-center">
        <p className="text-gray-600">이미 결제 완료된 주문입니다.</p>
        <Link href={`/orders/${id}/complete`} className="mt-4 inline-block text-sm font-medium text-gray-700 underline">
          주문 완료 페이지로
        </Link>
      </div>
    );
  }

  if (status === 'CANCELLED') {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 text-center">
        <p className="text-gray-600">취소된 주문입니다.</p>
        <Link href="/products" className="mt-4 inline-block text-sm font-medium text-gray-700 underline">
          상품 목록
        </Link>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 text-center">
        <p className="text-gray-600">주문을 찾을 수 없습니다.</p>
        <Link href="/products" className="mt-4 inline-block text-sm font-medium text-gray-700 underline">
          상품 목록
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-semibold text-gray-900">결제</h1>
      <p className="mt-1 text-sm text-gray-500">주문 번호: {order.orderNumber}</p>

      <div className="mt-6 rounded-lg border border-gray-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-gray-700">주문 상품</h2>
        <ul className="mt-3 space-y-2">
          {order.items?.map((item) => (
            <li key={item.id} className="flex justify-between text-sm">
              <span className="text-gray-800">
                {item.productName}
                {item.optionLabel ? ` (${item.optionLabel})` : ''} × {item.quantity}
              </span>
              <span className="font-medium">{item.lineTotal?.toLocaleString()}원</span>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex justify-between border-t border-gray-100 pt-3 text-sm">
          <span className="text-gray-600">상품 금액</span>
          <span>{order.totalProductAmount?.toLocaleString()}원</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">배송비</span>
          <span>{order.shippingFee ? `${order.shippingFee.toLocaleString()}원` : '무료'}</span>
        </div>
        <div className="mt-2 flex justify-between font-semibold text-lg">
          <span>총 결제 금액</span>
          <span>{order.totalAmount?.toLocaleString()}원</span>
        </div>
      </div>

      <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
        <h2 className="text-sm font-semibold text-gray-700">배송 정보</h2>
        <dl className="mt-2 space-y-1 text-sm text-gray-600">
          <div><dt className="inline font-medium text-gray-700">수령인 </dt><dd className="inline">{order.recipientName}</dd></div>
          <div><dt className="inline font-medium text-gray-700">연락처 </dt><dd className="inline">{order.recipientPhone}</dd></div>
          <div><dt className="inline font-medium text-gray-700">주소 </dt><dd className="inline">{order.zipCode} {order.address} {order.addressDetail || ''}</dd></div>
        </dl>
      </div>

      {error && (
        <div className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700" role="alert">
          {error}
        </div>
      )}

      <div className="mt-8 flex flex-wrap gap-3">
        <button
          type="button"
          disabled={paying}
          onClick={handlePay}
          className="rounded-lg bg-gray-900 px-6 py-3 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {paying ? '처리 중…' : '결제하기 (시뮬레이션)'}
        </button>
        <button
          type="button"
          disabled={cancelling}
          onClick={handleCancel}
          className="rounded-lg border border-red-300 px-6 py-3 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
        >
          {cancelling ? '처리 중…' : '주문 취소'}
        </button>
        <Link href="/cart" className="rounded-lg border border-gray-300 px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50">
          장바구니로
        </Link>
      </div>
    </div>
  );
}
