'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

const ADMIN_TOKEN_KEY = 'adminToken';

const statusLabel = {
  PENDING: '승인 대기',
  APPROVED: '승인됨',
  REJECTED: '반려',
};

const brandLabel = { CAMI: '까미', IVY: '아이비' };
const petLabel = { DOG: '강아지', CAT: '고양이' };

function ProductsContent() {
  const searchParams = useSearchParams();
  const statusFilter = searchParams.get('status') || '';
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [acting, setActing] = useState(null);

  function getToken() {
    return typeof window !== 'undefined' ? localStorage.getItem(ADMIN_TOKEN_KEY) : null;
  }

  function fetchList() {
    const token = getToken();
    if (!token) return;
    setLoading(true);
    const url = statusFilter ? `/api/admin/products?status=${statusFilter}` : '/api/admin/products';
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        if (!res.ok) throw new Error('목록 로드 실패');
        return res.json();
      })
      .then(setList)
      .catch(() => setError('목록을 불러올 수 없습니다.'))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchList();
  }, [statusFilter]);

  async function handleApproval(productId, approvalStatus) {
    const token = getToken();
    if (!token) return;
    setActing(productId);
    setError('');
    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ approvalStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '처리 실패');
      fetchList();
    } catch (err) {
      setError(err.message || '처리 중 오류가 발생했습니다.');
    } finally {
      setActing(null);
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
        <h1 className="text-2xl font-semibold text-gray-900">상품 승인</h1>
        <Link href="/admin" className="text-sm font-medium text-gray-600 hover:text-gray-900">
          ← 대시보드
        </Link>
      </div>
      <p className="mt-1 text-sm text-gray-500">
        입점업체가 등록한 상품을 승인하거나 반려합니다. 승인된 상품만 웹사이트에 노출됩니다.
      </p>
      <div className="mt-4 flex gap-2">
        <Link
          href="/admin/products"
          className={`rounded-md px-3 py-1.5 text-sm font-medium ${
            !statusFilter ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          전체
        </Link>
        <Link
          href="/admin/products?status=PENDING"
          className={`rounded-md px-3 py-1.5 text-sm font-medium ${
            statusFilter === 'PENDING' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          승인 대기
        </Link>
        <Link
          href="/admin/products?status=APPROVED"
          className={`rounded-md px-3 py-1.5 text-sm font-medium ${
            statusFilter === 'APPROVED' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          승인됨
        </Link>
        <Link
          href="/admin/products?status=REJECTED"
          className={`rounded-md px-3 py-1.5 text-sm font-medium ${
            statusFilter === 'REJECTED' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          반려
        </Link>
      </div>
      {error && (
        <div className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700" role="alert">
          {error}
        </div>
      )}
      <div className="mt-6 overflow-x-auto">
        {list.length === 0 ? (
          <p className="py-12 text-center text-gray-500">해당 상태의 상품이 없습니다.</p>
        ) : (
          <ul className="space-y-4">
            {list.map((p) => (
              <li
                key={p.id}
                className="flex flex-col gap-4 rounded-lg border border-gray-200 bg-white p-4 sm:flex-row sm:items-center"
              >
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-md bg-gray-100">
                  {p.images?.[0]?.url ? (
                    <img src={p.images[0].url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-gray-400">이미지 없음</div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-900">
                    <Link href={`/admin/products/${p.id}`} className="hover:underline">
                      {p.name || '상품명 없음'}
                    </Link>
                  </p>
                  {(p.brand || p.petType || p.category?.name) && (
                    <p className="mt-0.5 text-sm text-gray-500">
                      {[p.brand && (brandLabel[p.brand] || p.brand), p.petType && (petLabel[p.petType] || p.petType), p.category?.name].filter(Boolean).join(' · ')}
                    </p>
                  )}
                  {(p.partner?.companyName || p.partner?.email) && (
                    <p className="mt-0.5 text-sm text-gray-500">
                      입점: {[p.partner.companyName, p.partner.email].filter(Boolean).join(' · ')}
                    </p>
                  )}
                  {(p.basePrice != null || p.totalStock != null) && (
                    <p className="mt-1 text-sm font-medium text-gray-700">
                      {[p.basePrice != null && `${Number(p.basePrice).toLocaleString()}원`, p.totalStock != null && `재고 ${p.totalStock}`].filter(Boolean).join(' · ')}
                    </p>
                  )}
                  {p.approvalStatus === 'REJECTED' && p.rejectionReason && (
                    <p className="mt-2 text-sm text-red-700">
                      반려 사유: {p.rejectionReason}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      p.approvalStatus === 'PENDING'
                        ? 'bg-amber-100 text-amber-800'
                        : p.approvalStatus === 'APPROVED'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {statusLabel[p.approvalStatus] ?? p.approvalStatus}
                  </span>
                  <Link
                    href={`/admin/products/${p.id}`}
                    className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    상세
                  </Link>
                  {p.approvalStatus === 'PENDING' && (
                    <button
                      type="button"
                      disabled={acting === p.id}
                      onClick={() => handleApproval(p.id, 'APPROVED')}
                      className="rounded-md bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                    >
                      {acting === p.id ? '처리 중…' : '승인'}
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default function AdminProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-12">
          <p className="text-gray-500">로딩 중…</p>
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
