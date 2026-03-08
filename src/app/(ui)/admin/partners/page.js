'use client';

import React, { useEffect, useCallback, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useVendorStore } from '@/store/vendorStore';
import { getPartners, updatePartnerStatus } from '@/lib/api/vendorApi';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';

const ADMIN_TOKEN_KEY = 'adminToken';
const statusLabel = {
  PENDING: '승인 대기',
  APPROVED: '승인됨',
  REJECTED: '반려',
};

function PartnersContent() {
  const searchParams = useSearchParams();
  const statusFilter = searchParams.get('status') || '';
  const {
    list,
    loading,
    error,
    setList,
    setLoading,
    setError,
    updateItemById,
  } = useVendorStore();
  const [acting, setActing] = useState(null);

  function getToken() {
    return typeof window !== 'undefined' ? localStorage.getItem(ADMIN_TOKEN_KEY) : null;
  }

  const fetchList = useCallback(() => {
    const token = getToken();
    if (!token) return;
    setLoading(true);
    getPartners(statusFilter || undefined)
      .then(setList)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [statusFilter, setList, setLoading, setError]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  async function handleStatus(id, status) {
    const token = getToken();
    if (!token) return;
    const prev = list.find((p) => p.id === id);
    updateItemById(id, { status });
    setActing(id);
    try {
      await updatePartnerStatus(id, status);
      fetchList();
    } catch (err) {
      if (prev) updateItemById(id, { status: prev.status });
      setError(err.message || '처리 중 오류가 발생했습니다.');
    } finally {
      setActing(null);
    }
  }

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">입점업체 관리</h1>
        <Link
          href="/admin"
          className="text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          ← 대시보드
        </Link>
      </div>
      <p className="mt-1 text-sm text-gray-500">
        입점 신청을 승인하거나 반려합니다. 승인된 업체만 상품 등록이 가능합니다.
      </p>
      <div className="mt-4 flex gap-2">
        <Link
          href="/admin/partners"
          className={`rounded-md px-3 py-1.5 text-sm font-medium ${
            !statusFilter
              ? 'bg-gray-900 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          전체
        </Link>
        <Link
          href="/admin/partners?status=PENDING"
          className={`rounded-md px-3 py-1.5 text-sm font-medium ${
            statusFilter === 'PENDING'
              ? 'bg-gray-900 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          승인 대기
        </Link>
        <Link
          href="/admin/partners?status=APPROVED"
          className={`rounded-md px-3 py-1.5 text-sm font-medium ${
            statusFilter === 'APPROVED'
              ? 'bg-gray-900 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          승인됨
        </Link>
        <Link
          href="/admin/partners?status=REJECTED"
          className={`rounded-md px-3 py-1.5 text-sm font-medium ${
            statusFilter === 'REJECTED'
              ? 'bg-gray-900 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          반려
        </Link>
      </div>
      <ErrorMessage message={error} onRetry={fetchList} className="mt-4" />
      <div className="mt-6 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                업체명 / 담당자
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                연락처
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                상태
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                상품 수
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">
                작업
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {list.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-500">
                  입점업체가 없습니다.
                </td>
              </tr>
            ) : (
              list.map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{p.companyName}</p>
                    <p className="text-sm text-gray-500">{p.email}</p>
                    <p className="text-xs text-gray-400">{p.contactName}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {p.contactPhone}
                    <br />
                    <span className="text-gray-400">사업자: {p.businessNumber}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        p.status === 'APPROVED'
                          ? 'bg-green-100 text-green-800'
                          : p.status === 'REJECTED'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {statusLabel[p.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{p._count?.products ?? 0}개</td>
                  <td className="px-4 py-3 text-right">
                    {p.status === 'PENDING' && (
                      <span className="inline-flex gap-2">
                        <button
                          type="button"
                          disabled={acting === p.id}
                          onClick={() => handleStatus(p.id, 'APPROVED')}
                          className="rounded-md bg-green-600 px-2 py-1 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50"
                        >
                          {acting === p.id ? '처리 중…' : '승인'}
                        </button>
                        <button
                          type="button"
                          disabled={acting === p.id}
                          onClick={() => handleStatus(p.id, 'REJECTED')}
                          className="rounded-md bg-red-600 px-2 py-1 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
                        >
                          반려
                        </button>
                      </span>
                    )}
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

export default function AdminPartnersPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <PartnersContent />
    </Suspense>
  );
}
