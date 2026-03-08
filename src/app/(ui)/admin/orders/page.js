'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';

const ADMIN_TOKEN_KEY = 'adminToken';
const STATUS_OPTIONS = [
  { value: '', label: '전체' },
  { value: 'PAYMENT_PENDING', label: '결제 대기' },
  { value: 'PAYMENT_COMPLETED', label: '결제 완료' },
  { value: 'CANCELLED', label: '취소' },
];
const PERIOD_OPTIONS = [
  { value: '7', label: '최근 7일' },
  { value: '30', label: '최근 30일' },
  { value: '90', label: '최근 90일' },
  { value: 'custom', label: '기간 직접 입력' },
];

function formatDate(d) {
  return new Date(d).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDateInput(d) {
  const x = new Date(d);
  const y = x.getFullYear();
  const m = String(x.getMonth() + 1).padStart(2, '0');
  const day = String(x.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function getToken() {
  return typeof window !== 'undefined' ? localStorage.getItem(ADMIN_TOKEN_KEY) : null;
}

export default function AdminOrdersPage() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [period, setPeriod] = useState('30');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [detailOrder, setDetailOrder] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchList = useCallback(() => {
    const token = getToken();
    if (!token) return;
    setLoading(true);
    setError('');
    const params = new URLSearchParams();
    if (statusFilter) params.set('status', statusFilter);
    if (period !== 'custom') {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - Number(period || 7));
      params.set('dateFrom', formatDateInput(start));
      params.set('dateTo', formatDateInput(end));
    } else if (dateFrom && dateTo) {
      params.set('dateFrom', dateFrom);
      params.set('dateTo', dateTo);
    }
    fetch(`/api/admin/orders?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => {
        if (!r.ok) throw new Error('목록을 불러올 수 없습니다.');
        return r.json();
      })
      .then(setList)
      .catch((err) => setError(err.message || '오류가 발생했습니다.'))
      .finally(() => setLoading(false));
  }, [statusFilter, period, dateFrom, dateTo]);

  useEffect(() => {
    if (period !== 'custom') {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - Number(period || 7));
      setDateFrom(formatDateInput(start));
      setDateTo(formatDateInput(end));
    }
  }, [period]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const handleStatusChange = useCallback(
    async (orderId, newStatus) => {
      const token = getToken();
      if (!token) return;
      setUpdatingId(orderId);
      try {
        const res = await fetch(`/api/admin/orders/${orderId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ status: newStatus }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || '변경 실패');
        if (detailOrder?.id === orderId) {
          setDetailOrder((prev) => (prev ? { ...prev, status: newStatus, paidAt: newStatus === 'PAYMENT_COMPLETED' ? new Date() : prev.paidAt } : null));
        }
        fetchList();
      } catch (err) {
        setError(err.message || '상태 변경에 실패했습니다.');
      } finally {
        setUpdatingId(null);
      }
    },
    [detailOrder, fetchList]
  );

  const statusLabel = useMemo(
    () => ({
      PAYMENT_PENDING: '결제 대기',
      PAYMENT_COMPLETED: '결제 완료',
      CANCELLED: '취소',
    }),
    []
  );

  const statusBadgeClass = (status) => {
    switch (status) {
      case 'PAYMENT_PENDING':
        return 'bg-amber-100 text-amber-800';
      case 'PAYMENT_COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">주문 관리</h1>
        <p className="mt-1 text-sm text-gray-500">전체 주문 목록을 조회하고 결제·취소 상태를 관리할 수 있습니다.</p>
      </div>

      {/* 필터 */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <p className="mb-3 text-sm font-medium text-gray-700">조회 조건</p>
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-xs text-gray-500">주문 상태</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="mt-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value || 'all'} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500">기간</label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="mt-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              {PERIOD_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          {period === 'custom' && (
            <>
              <div>
                <label className="block text-xs text-gray-500">시작일</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="mt-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500">종료일</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="mt-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
            </>
          )}
          <button
            type="button"
            onClick={fetchList}
            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            조회
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* 목록 테이블 */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        {loading ? (
          <div className="py-12 text-center text-sm text-gray-500">목록을 불러오는 중…</div>
        ) : list.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-500">조건에 맞는 주문이 없습니다.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">주문번호</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">주문일시</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">수령인</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">결제금액</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">상태</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {list.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/50">
                    <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900">
                      {order.orderNumber}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {order.recipientName}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900">
                      {Number(order.totalAmount || 0).toLocaleString()}원
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusBadgeClass(order.status)}`}>
                        {statusLabel[order.status] || order.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => setDetailOrder(order)}
                        className="text-sm font-medium text-gray-700 hover:text-gray-900 underline"
                      >
                        상세
                      </button>
                      {order.status === 'PAYMENT_PENDING' && (
                        <>
                          <button
                            type="button"
                            disabled={updatingId === order.id}
                            onClick={() => handleStatusChange(order.id, 'PAYMENT_COMPLETED')}
                            className="ml-2 rounded border border-gray-800 bg-gray-800 px-2 py-1 text-xs font-medium text-white hover:bg-gray-700 disabled:opacity-50"
                          >
                            {updatingId === order.id ? '처리 중…' : '결제 완료'}
                          </button>
                          <button
                            type="button"
                            disabled={updatingId === order.id}
                            onClick={() => handleStatusChange(order.id, 'CANCELLED')}
                            className="ml-1 rounded border border-gray-300 bg-white px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                          >
                            취소
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 주문 상세 모달 */}
      {detailOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setDetailOrder(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 flex items-center justify-between border-b bg-white px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">주문 상세 · {detailOrder.orderNumber}</h2>
              <button
                type="button"
                onClick={() => setDetailOrder(null)}
                className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                aria-label="닫기"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4 p-6">
              <div className="grid gap-3 text-sm sm:grid-cols-2">
                <div><span className="text-gray-500">주문일시</span> <span className="font-medium">{formatDate(detailOrder.createdAt)}</span></div>
                <div><span className="text-gray-500">상태</span> <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusBadgeClass(detailOrder.status)}`}>{statusLabel[detailOrder.status] || detailOrder.status}</span></div>
                <div><span className="text-gray-500">수령인</span> <span className="font-medium">{detailOrder.recipientName}</span></div>
                <div><span className="text-gray-500">연락처</span> <span>{detailOrder.recipientPhone}</span></div>
                <div className="sm:col-span-2"><span className="text-gray-500">주소</span> <span>{[detailOrder.zipCode, detailOrder.address, detailOrder.addressDetail].filter(Boolean).join(' ')}</span></div>
                {detailOrder.memo && <div className="sm:col-span-2"><span className="text-gray-500">배송 메모</span> <span>{detailOrder.memo}</span></div>}
              </div>
              <div>
                <h3 className="mb-2 text-sm font-medium text-gray-700">주문 상품</h3>
                <ul className="divide-y divide-gray-100 rounded-lg border border-gray-100">
                  {detailOrder.items?.map((item) => (
                    <li key={item.id} className="flex gap-3 p-3">
                      <div className="h-16 w-16 shrink-0 overflow-hidden rounded border bg-gray-50">
                        {item.product?.images?.[0]?.url ? (
                          <img src={item.product.images[0].url} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">-</div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900">{item.productName}</p>
                        <p className="text-xs text-gray-500">{item.optionLabel || '단일'}</p>
                        <p className="mt-0.5 text-sm font-medium text-gray-900">{item.lineTotal?.toLocaleString()}원 × {item.quantity}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="border-t pt-4 text-sm">
                <p className="flex justify-between text-gray-600"><span>상품금액</span> <span>{detailOrder.totalProductAmount?.toLocaleString()}원</span></p>
                <p className="flex justify-between text-gray-600"><span>배송비</span> <span>{detailOrder.shippingFee?.toLocaleString()}원</span></p>
                <p className="mt-2 flex justify-between font-semibold text-gray-900"><span>총 결제금액</span> <span>{detailOrder.totalAmount?.toLocaleString()}원</span></p>
              </div>
              {detailOrder.status === 'PAYMENT_PENDING' && (
                <div className="flex gap-2 border-t pt-4">
                  <button
                    type="button"
                    disabled={updatingId === detailOrder.id}
                    onClick={() => handleStatusChange(detailOrder.id, 'PAYMENT_COMPLETED')}
                    className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
                  >
                    결제 완료 처리
                  </button>
                  <button
                    type="button"
                    disabled={updatingId === detailOrder.id}
                    onClick={() => handleStatusChange(detailOrder.id, 'CANCELLED')}
                    className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    주문 취소
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
