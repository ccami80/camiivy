'use client';

import Link from 'next/link';

function formatPrice(n) {
  return new Intl.NumberFormat('ko-KR').format(n) + '원';
}

export default function OrderCompleteInfo({ order }) {
  if (!order) {
    return (
      <div className="text-center">
        <p className="text-sm text-gray-600">주문 정보가 없습니다.</p>
        <Link href="/" className="mt-4 inline-block text-sm font-medium text-gray-700 hover:text-gray-900">
          홈으로
        </Link>
      </div>
    );
  }

  const total = order.totalAmount ?? (order.items || []).reduce((sum, i) => sum + (i.price || 0) * (i.quantity || 1), 0);

  return (
    <div className="mx-auto max-w-lg">
      <div className="rounded-lg border border-gray-100 bg-white p-8 text-center">
        <h1 className="text-xl font-semibold text-gray-900">주문 완료</h1>
        <p className="mt-3 text-sm text-gray-500">주문 번호</p>
        {/* TODO: orderId는 현재 프론트 더미. 실제 주문 생성 API 연동 후 서버 발급 번호 표시 */}
        <p className="mt-1 font-mono text-base font-medium text-gray-800">{order.orderId || '—'}</p>
      </div>

      <div className="mt-6 rounded-lg border border-gray-100 bg-white p-5">
        <h2 className="text-sm font-medium text-gray-800">주문 상품</h2>
        <ul className="mt-4 space-y-3">
          {(order.items || []).map((i) => (
            <li key={i.id} className="flex justify-between text-sm">
              <span className="text-gray-700">
                {i.name}
                {i.option && ` (${i.option})`} × {i.quantity}
              </span>
              <span className="font-medium text-gray-800">{formatPrice((i.price || 0) * (i.quantity || 1))}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 border-t border-gray-100 pt-3 text-right font-semibold text-gray-900">
          총 결제 금액 {formatPrice(total)}
        </p>
      </div>

      <div className="mt-8 text-center">
        <Link
          href="/my"
          className="inline-block rounded-md border border-gray-800 bg-gray-800 px-6 py-3 text-sm font-medium text-white hover:bg-gray-700"
        >
          마이페이지로
        </Link>
      </div>
    </div>
  );
}
