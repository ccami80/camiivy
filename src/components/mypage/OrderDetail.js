'use client';

import Link from 'next/link';

const STATUS_LABEL = {
  PAYMENT_PENDING: '결제 대기',
  PAYMENT_COMPLETED: '결제 완료',
  PREPARING: '상품 준비중',
  SHIPPED: '배송중',
  DELIVERED: '배송 완료',
  CANCELLED: '취소',
  REFUNDED: '환불',
};

function formatPrice(n) {
  return new Intl.NumberFormat('ko-KR').format(n) + '원';
}

export default function OrderDetail({ order }) {
  if (!order) {
    return (
      <div className="rounded-lg border border-gray-100 bg-white p-10 text-center text-sm text-gray-500">
        주문을 찾을 수 없습니다.
        <Link href="/my/orders" className="mt-3 block text-sm text-gray-600 hover:text-gray-900">
          주문 목록으로
        </Link>
      </div>
    );
  }

  const items = order.items || [];
  const total = items.reduce((sum, i) => sum + (i.price || 0) * (i.quantity || 1), 0);
  const canCancel = order.status !== 'CANCELLED' && order.status !== 'REFUNDED' && order.status !== 'DELIVERED';

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">
            주문번호 {order.orderId || order.id}
          </h1>
          <p className="mt-1 text-sm text-gray-500">{order.orderDate}</p>
        </div>
        <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">
          {STATUS_LABEL[order.status] ?? order.status}
        </span>
      </div>

      <div className="rounded-lg border border-gray-100 bg-white p-5">
        <h2 className="text-sm font-medium uppercase tracking-wider text-gray-500">배송 정보</h2>
        <dl className="mt-4 space-y-2 text-sm text-gray-600">
          <div><dt className="inline font-medium">수령인 </dt><dd className="inline">{order.receiverName || '—'}</dd></div>
          <div><dt className="inline font-medium">연락처 </dt><dd className="inline">{order.receiverPhone || '—'}</dd></div>
          <div><dt className="inline font-medium">주소 </dt><dd className="inline">{order.receiverAddress || '—'}</dd></div>
        </dl>
      </div>

      <div className="rounded-lg border border-gray-100 bg-white p-5">
        <h2 className="text-sm font-medium uppercase tracking-wider text-gray-500">주문 상품</h2>
        <ul className="mt-4 divide-y divide-gray-100">
          {items.map((i) => (
            <li key={i.id} className="flex justify-between py-3.5 text-sm">
              <span className="text-gray-700">
                {i.name}
                {i.option && ` (${i.option})`} × {i.quantity}
              </span>
              <span className="text-gray-800">
                {formatPrice((i.price || 0) * (i.quantity || 1))}
              </span>
            </li>
          ))}
        </ul>
        <div className="border-t border-gray-100 pt-4 text-right text-sm font-medium text-gray-900">
          총 결제 금액 {formatPrice(order.totalAmount ?? total)}
        </div>
      </div>

      {/* TODO: 주문 취소/환불 버튼 동작 없음. 취소/환불 API 연동 필요 */}
      {canCancel && (
        <div className="flex gap-3">
          <button
            type="button"
            className="rounded-md border border-gray-800 bg-gray-800 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-700"
          >
            주문 취소
          </button>
          <button
            type="button"
            className="rounded-md border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
          >
            환불 요청
          </button>
        </div>
      )}

      <Link href="/my/orders" className="inline-block text-sm text-gray-500 hover:text-gray-900">
        ← 주문 목록
      </Link>
    </div>
  );
}
