'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';

const USER_TOKEN_KEY = 'userToken';
const STATUS_LABEL = { PAYMENT_PENDING: '결제 대기', PAYMENT_COMPLETED: '결제 완료', CANCELLED: '취소' };

function getRangeForPeriod(period, customStart, customEnd) {
  const now = new Date();
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
  let start;
  if (period === '6m') {
    start = new Date(end);
    start.setMonth(start.getMonth() - 6);
    start.setHours(0, 0, 0, 0);
  } else if (period === '1y') {
    start = new Date(end);
    start.setFullYear(start.getFullYear() - 1);
    start.setHours(0, 0, 0, 0);
  } else {
    if (customStart && customEnd) {
      start = new Date(customStart);
      start.setHours(0, 0, 0, 0);
      const endDate = new Date(customEnd);
      endDate.setHours(23, 59, 59, 999);
      return { start, end: endDate };
    }
    start = new Date(end);
    start.setMonth(start.getMonth() - 6);
    start.setHours(0, 0, 0, 0);
    return { start, end };
  }
  return { start, end };
}

function formatDateForInput(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export default function MyOrdersPage() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('6m');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem(USER_TOKEN_KEY) : null;
    if (!token) {
      setLoading(false);
      return;
    }
    fetch('/api/user/orders', { headers: { Authorization: `Bearer ${token}` }, credentials: 'include' })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setList(Array.isArray(data) ? data : []))
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  }, []);

  const { start: rangeStart, end: rangeEnd } = useMemo(
    () => getRangeForPeriod(period, customStart, customEnd),
    [period, customStart, customEnd]
  );

  const filteredList = useMemo(() => {
    return list.filter((order) => {
      const t = new Date(order.createdAt).getTime();
      return t >= rangeStart.getTime() && t <= rangeEnd.getTime();
    });
  }, [list, rangeStart, rangeEnd]);

  const defaultCustomStart = useMemo(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 6);
    return formatDateForInput(d);
  }, []);
  const defaultCustomEnd = useMemo(() => formatDateForInput(new Date()), []);

  if (loading) return <p className="text-gray-500">로딩 중…</p>;

  return (
    <div className="max-w-4xl">
      <h1 className="text-xl font-bold text-gray-900">주문/배송 내역</h1>

      {/* 기간 선택 */}
      <div className="mt-6 rounded-lg border border-gray-200 bg-white p-4">
        <p className="mb-3 text-sm font-medium text-gray-700">조회 기간</p>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex rounded-md border border-gray-200 bg-gray-50 p-0.5">
            {[
              { value: '6m', label: '6개월' },
              { value: '1y', label: '1년' },
              { value: 'custom', label: '직접 입력' },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setPeriod(opt.value)}
                className={`rounded px-4 py-2 text-sm font-medium transition-colors ${
                  period === opt.value
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {period === 'custom' && (
            <>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={customStart || defaultCustomStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="rounded border border-gray-300 px-3 py-2 text-sm"
                />
                <span className="text-gray-400">~</span>
                <input
                  type="date"
                  value={customEnd || defaultCustomEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="rounded border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
              <button
                type="button"
                onClick={() => setPeriod('custom')}
                className="rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
              >
                조회
              </button>
            </>
          )}
        </div>
      </div>

      {/* 주문 목록 */}
      <div className="mt-6">
        {list.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-white py-16 text-center">
            <p className="text-gray-500">주문 내역이 없습니다.</p>
            <p className="mt-1 text-sm text-gray-400">로그인 후 주문한 건만 표시됩니다.</p>
          </div>
        ) : filteredList.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-white py-16 text-center">
            <p className="text-gray-500">해당 기간에 주문 내역이 없습니다.</p>
          </div>
        ) : (
          <ul className="space-y-4">
            {filteredList.map((order) => (
              <li key={order.id} className="rounded-lg border border-gray-200 bg-white overflow-hidden">
                <div className="border-b border-gray-100 bg-gray-50 px-4 py-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-semibold text-gray-900">{order.orderNumber}</span>
                      <span className="text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString('ko-KR', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        order.status === 'PAYMENT_PENDING'
                          ? 'bg-amber-100 text-amber-800'
                          : order.status === 'PAYMENT_COMPLETED'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {STATUS_LABEL[order.status] || order.status}
                    </span>
                  </div>
                </div>
                <div className="divide-y divide-gray-100">
                  {order.items?.map((item) => {
                    const thumb = item.product?.images?.[0]?.url;
                    const productId = item.productId || item.product?.id;
                    return (
                      <div key={item.id} className="flex items-stretch gap-4 p-4">
                        <Link
                          href={productId ? `/products/${productId}` : '#'}
                          className="h-24 w-24 shrink-0 overflow-hidden rounded-md border border-gray-100 bg-gray-50 block hover:opacity-90"
                        >
                          {thumb ? (
                            <img src={thumb} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                              이미지 없음
                            </div>
                          )}
                        </Link>
                        <div className="min-w-0 flex-1 py-0.5">
                          <Link
                            href={productId ? `/products/${productId}` : '#'}
                            className="font-semibold text-gray-900 hover:underline"
                          >
                            {item.productName}
                          </Link>
                          <p className="mt-0.5 text-sm text-gray-500">
                            {item.optionLabel || '단일상품'}
                          </p>
                          <p className="mt-1 font-semibold text-gray-900">
                            {item.lineTotal?.toLocaleString()}원
                          </p>
                          <p className="mt-0.5 text-sm text-gray-500">수량 {item.quantity}</p>
                        </div>
                        <div className="flex shrink-0 flex-col items-end justify-center border-l border-gray-100 pl-4">
                          <span
                            className={`text-sm font-medium ${
                              order.status === 'PAYMENT_PENDING'
                                ? 'text-amber-600'
                                : order.status === 'PAYMENT_COMPLETED'
                                  ? 'text-blue-600'
                                  : 'text-gray-500'
                            }`}
                          >
                            {STATUS_LABEL[order.status] || order.status}
                          </span>
                          <Link
                            href={`/my/orders/${order.id}`}
                            className="mt-2 rounded border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                          >
                            상세보기
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="border-t border-gray-100 bg-gray-50 px-4 py-3 flex justify-between items-center">
                  <span className="text-sm font-semibold text-gray-900">
                    총 결제금액 {order.totalAmount?.toLocaleString()}원
                  </span>
                  <Link
                    href={`/my/orders/${order.id}`}
                    className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-gray-900"
                  >
                    주문 상세보기
                    <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
