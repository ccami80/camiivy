'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import BreadcrumbNav from '@/components/website/BreadcrumbNav';

const USER_TOKEN_KEY = 'userToken';
const STATUS_LABEL = { CANCELLED: '취소완료' };

function formatDate(d) {
  if (!d) return '-';
  return new Date(d).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function MyCancelReturnsPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem(USER_TOKEN_KEY) : null;
    if (!token) {
      setLoading(false);
      return;
    }
    fetch('/api/user/orders', { headers: { Authorization: `Bearer ${token}` }, credentials: 'include' })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setOrders(list.filter((o) => o.status === 'CANCELLED'));
      })
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <BreadcrumbNav label="취소/교환/반품 내역" />

      <header>
        <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl">취소/교환/반품 내역</h1>
        <p className="mt-1 text-sm text-gray-500">
          취소·교환·반품 신청한 주문을 확인할 수 있습니다.
        </p>
      </header>

      {loading ? (
        <p className="py-8 text-center text-gray-500">목록을 불러오는 중…</p>
      ) : orders.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white px-6 py-12 text-center">
          <p className="text-gray-500">취소/교환/반품 내역이 없습니다.</p>
          <Link href="/my/orders" className="mt-3 inline-block text-sm font-medium text-gray-700 underline hover:text-gray-900">
            주문 내역 보기
          </Link>
        </div>
      ) : (
        <ul className="space-y-4">
          {orders.map((order) => (
            <li key={order.id} className="rounded-xl border border-gray-200 bg-white overflow-hidden">
              <Link
                href={`/my/orders/${order.id}`}
                className="flex flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-5 hover:bg-gray-50"
              >
                <div className="min-w-0">
                  <p className="font-medium text-gray-900">{order.orderNumber}</p>
                  <p className="mt-0.5 text-sm text-gray-500">{formatDate(order.createdAt)}</p>
                </div>
                <span className="rounded-full bg-gray-200 px-3 py-1 text-xs font-medium text-gray-800">
                  {STATUS_LABEL[order.status] || order.status}
                </span>
              </Link>
              {order.items?.length > 0 && (
                <div className="border-t border-gray-100 px-4 py-3 sm:px-5">
                  <p className="text-sm text-gray-600">
                    {order.items[0].productName}
                    {order.items.length > 1 ? ` 외 ${order.items.length - 1}건` : ''}
                  </p>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
