'use client';

import { useEffect, useState } from 'react';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';

const PARTNER_TOKEN_KEY = 'partnerToken';

const STATUS_LABEL = {
  PAYMENT_PENDING: '결제 대기',
  PAYMENT_COMPLETED: '결제 완료',
  PREPARING: '상품 준비중',
  SHIPPED: '배송중',
  DELIVERED: '배송 완료',
  CANCELLED: '취소',
};

function formatMoney(n) {
  return new Intl.NumberFormat('ko-KR').format(n) + '원';
}

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

export default function PartnerOrdersPage() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem(PARTNER_TOKEN_KEY) : null;
    if (!token) return;
    fetch('/api/partner/orders', { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        if (!res.ok) throw new Error('주문 목록 조회 실패');
        return res.json();
      })
      .then(setList)
      .catch((e) => setError(e.message || '목록을 불러올 수 없습니다.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-800">주문 관리</h1>
        <p className="mt-1 text-sm text-gray-500">내 상품이 포함된 주문만 조회됩니다.</p>
      </div>

      <ErrorMessage message={error} />

      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                주문번호
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                상태
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                내 상품 금액
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                주문일
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {list.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-12 text-center text-sm text-gray-500">
                  주문 내역이 없습니다.
                </td>
              </tr>
            ) : (
              list.map((order) => (
                <tr key={order.id}>
                  <td className="px-4 py-3 font-mono text-sm text-gray-800">
                    {order.orderNumber}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                      {STATUS_LABEL[order.status] ?? order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-800">
                    {formatMoney(order.partnerAmount)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {formatDate(order.createdAt)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
