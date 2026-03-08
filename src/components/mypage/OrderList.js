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

export default function OrderList({ orders }) {
  if (!orders?.length) {
    return (
      <div className="rounded-lg border border-gray-100 bg-white p-10 text-center text-sm text-gray-500">
        주문 내역이 없습니다.
      </div>
    );
  }

  return (
    <ul className="space-y-5">
      {orders.map((order) => (
        <li key={order.id}>
          <Link
            href={`/my/orders/${order.id}`}
            className="block rounded-lg border border-gray-100 bg-white p-5 transition-colors hover:bg-gray-50"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-mono text-sm text-gray-800">
                {order.orderId || order.id}
              </span>
              <span className="text-xs text-gray-500">{order.orderDate}</span>
            </div>
            <p className="mt-3 line-clamp-1 text-sm text-gray-600">
              {order.summary || order.items?.[0]?.name}
              {(order.items?.length > 1) && ` 외 ${order.items.length - 1}건`}
            </p>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm text-gray-800">
                {formatPrice(order.totalAmount || 0)}
              </span>
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                {STATUS_LABEL[order.status] ?? order.status}
              </span>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
