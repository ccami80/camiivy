'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

const USER_TOKEN_KEY = 'userToken';
const STATUS_LABEL = { PAYMENT_PENDING: '결제 대기', PAYMENT_COMPLETED: '결제 완료', CANCELLED: '취소' };

export default function OrderDetailPage() {
  const params = useParams();
  const id = params?.id;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    const token = typeof window !== 'undefined' ? localStorage.getItem(USER_TOKEN_KEY) : null;
    if (!token) {
      setError('로그인이 필요합니다.');
      setLoading(false);
      return;
    }
    fetch(`/api/user/orders/${id}`, { headers: { Authorization: `Bearer ${token}` }, credentials: 'include' })
      .then((r) => {
        if (r.status === 404) throw new Error('주문을 찾을 수 없습니다.');
        if (!r.ok) throw new Error('주문을 불러올 수 없습니다.');
        return r.json();
      })
      .then(setOrder)
      .catch((err) => setError(err?.message || '주문을 찾을 수 없습니다.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="text-gray-500">로딩 중…</p>;
  if (error || !order) return <p className="text-red-600">{error || '주문을 찾을 수 없습니다.'}</p>;

  return (
    <div>
      <Link href="/my/orders" className="text-sm font-medium text-gray-600 hover:underline">← 주문 목록</Link>
      <h1 className="mt-4 text-2xl font-semibold text-gray-900">주문 상세</h1>
      <p className="mt-1 text-gray-500">주문 번호: {order.orderNumber}</p>
      <span className={`mt-2 inline-block rounded-full px-3 py-1 text-sm font-medium ${
        order.status === 'PAYMENT_PENDING' ? 'bg-amber-100 text-amber-800' :
        order.status === 'PAYMENT_COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
      }`}>
        {STATUS_LABEL[order.status] || order.status}
      </span>

      <div className="mt-6 rounded-lg border border-gray-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-gray-700">주문 상품</h2>
        <ul className="mt-3 space-y-3">
          {order.items?.map((item) => (
            <li key={item.id} className="flex gap-4 border-b border-gray-100 pb-3 last:border-0 last:pb-0">
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded border bg-gray-50">
                {item.product?.images?.[0]?.url ? (
                  <img src={item.product.images[0].url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-gray-400">이미지 없음</div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-gray-900">{item.productName}</p>
                {item.optionLabel && <p className="text-sm text-gray-500">옵션: {item.optionLabel}</p>}
                <p className="text-sm text-gray-600">{item.quantity}개 × {item.unitPrice?.toLocaleString()}원 = {item.lineTotal?.toLocaleString()}원</p>
                {order.status === 'PAYMENT_COMPLETED' && (
                  <Link href={`/my/reviews/write?productId=${item.productId}&orderItemId=${item.id}`} className="mt-1 inline-block text-sm font-medium text-gray-600 hover:underline">
                    리뷰 작성
                  </Link>
                )}
              </div>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex justify-between border-t border-gray-100 pt-3 text-sm">
          <span className="text-gray-600">상품 금액</span>
          <span>{order.totalProductAmount?.toLocaleString()}원</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">배송비</span>
          <span>{order.shippingFee ? `${order.shippingFee.toLocaleString()}원` : '무료'}</span>
        </div>
        <div className="mt-2 flex justify-between font-semibold">
          <span>총 결제 금액</span>
          <span>{order.totalAmount?.toLocaleString()}원</span>
        </div>
      </div>

      <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
        <h2 className="text-sm font-semibold text-gray-700">배송지</h2>
        <p className="mt-2 text-sm text-gray-600">{order.recipientName} / {order.recipientPhone}</p>
        <p className="text-sm text-gray-600">{order.zipCode} {order.address} {order.addressDetail || ''}</p>
      </div>
    </div>
  );
}
