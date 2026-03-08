'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function OrderCompletePage() {
  const params = useParams();
  const id = params?.id;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/orders/${id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then(setOrder)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <p className="text-gray-500">로딩 중…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 text-center">
      <h1 className="text-2xl font-semibold text-gray-900">주문이 완료되었습니다</h1>
      {order && (
        <>
          <p className="mt-2 text-gray-600">주문 번호: <strong>{order.orderNumber}</strong></p>
          <p className="mt-1 text-sm text-gray-500">
            결제 금액 {order.totalAmount?.toLocaleString()}원
          </p>
          <div className="mt-8 rounded-lg border border-gray-200 bg-white p-6 text-left">
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
          </div>
        </>
      )}
      <div className="mt-8 flex justify-center gap-4">
        <Link href="/products" className="rounded-lg bg-gray-900 px-6 py-3 text-sm font-medium text-white hover:bg-gray-800">
          쇼핑 계속하기
        </Link>
        <Link href="/" className="rounded-lg border border-gray-300 px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50">
          메인으로
        </Link>
      </div>
    </div>
  );
}
