'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

const PARTNER_TOKEN_KEY = 'partnerToken';

const statusLabel = {
  PENDING: '승인 대기',
  APPROVED: '승인됨',
  REJECTED: '반려',
};

function PartnerProductsContent() {
  const searchParams = useSearchParams();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const justRegistered = searchParams.get('registered') === '1';

  function getToken() {
    return typeof window !== 'undefined' ? localStorage.getItem(PARTNER_TOKEN_KEY) : null;
  }

  const fetchList = useCallback(() => {
    const token = getToken();
    if (!token) return;
    setLoading(true);
    fetch('/api/partner/products', { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        if (!res.ok) throw new Error('목록 로드 실패');
        return res.json();
      })
      .then(setList)
      .catch(() => setError('목록을 불러올 수 없습니다.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  async function handleDelete(p) {
    if (!confirm(`"${p.name}" 상품을 삭제하시겠습니까? 삭제 후에는 복구할 수 없습니다.`)) return;
    const token = getToken();
    if (!token) return;
    setDeletingId(p.id);
    setError('');
    try {
      const res = await fetch(`/api/partner/products/${p.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || '삭제에 실패했습니다.');
      fetchList();
    } catch (err) {
      setError(err.message || '삭제 중 오류가 발생했습니다.');
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-500">로딩 중…</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">상품 목록</h1>
        <Link
          href="/partner/products/new"
          className="rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          상품 등록
        </Link>
      </div>
      <p className="mt-1 text-sm text-gray-500">
        등록한 상품 목록입니다. 상태가 <strong>승인 대기(PENDING)</strong>인 상품은 관리자 승인 전까지 쇼핑몰에 노출되지 않습니다.
      </p>
      {justRegistered && (
        <div className="mt-4 rounded-md bg-green-50 p-3 text-sm text-green-800" role="status">
          상품이 등록되었습니다. <strong>승인 대기</strong> 상태로 저장되었으며, 관리자 승인 후 사이트에 노출됩니다.
        </div>
      )}
      {error && (
        <div className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700" role="alert">
          {error}
        </div>
      )}
      <div className="mt-6 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                이미지
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                상품명
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                카테고리
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                가격 / 재고
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                상태
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">
                작업
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {list.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500">
                  등록한 상품이 없습니다.{' '}
                  <Link href="/partner/products/new" className="underline hover:text-gray-700">
                    상품 등록
                  </Link>
                </td>
              </tr>
            ) : (
              list.map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-3">
                    <Link href={`/partner/products/${p.id}/edit`} className="block h-12 w-12 overflow-hidden rounded border border-gray-100 bg-gray-50">
                      {p.images?.[0]?.url ? (
                        <img src={p.images[0].url} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center text-xs text-gray-400">-</span>
                      )}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/partner/products/${p.id}/edit`} className="font-medium text-gray-900 hover:underline">
                      {p.name}
                    </Link>
                    <span className="ml-2 text-xs text-gray-500">(수정)</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{p.category?.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {p.basePrice?.toLocaleString()}원 / {p.totalStock}개
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        p.approvalStatus === 'APPROVED'
                          ? 'bg-green-100 text-green-800'
                          : p.approvalStatus === 'REJECTED'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {statusLabel[p.approvalStatus] || p.approvalStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/partner/products/${p.id}/edit`}
                      className="mr-2 rounded-md border border-gray-300 px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
                    >
                      수정
                    </Link>
                    <button
                      type="button"
                      disabled={deletingId === p.id}
                      onClick={() => handleDelete(p)}
                      className="rounded-md border border-red-200 bg-white px-2.5 py-1 text-xs font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
                    >
                      {deletingId === p.id ? '삭제 중…' : '삭제'}
                    </button>
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

export default function PartnerProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-12">
          <p className="text-gray-500">로딩 중…</p>
        </div>
      }
    >
      <PartnerProductsContent />
    </Suspense>
  );
}
