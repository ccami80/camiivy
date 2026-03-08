'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('adminToken');
}

export default function AdminDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    fetch('/api/admin/dashboard', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('대시보드 로드 실패');
        return res.json();
      })
      .then(setData)
      .catch(() => setError('데이터를 불러올 수 없습니다.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-500">로딩 중…</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-5 text-sm text-gray-700">
        {error}
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-900">대시보드</h1>
      <p className="mt-2 text-sm text-gray-500">
        입점업체 승인 후 상품 승인 시 웹사이트에 노출됩니다.
      </p>

      <div className="mt-10">
        <h2 className="text-xs font-medium uppercase tracking-wider text-gray-500">기본 통계</h2>
        <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-gray-100 bg-white p-5">
            <p className="text-xs font-medium text-gray-500">회원 수</p>
            <p className="mt-2 text-xl font-medium text-gray-900">{data?.usersTotal ?? 0}</p>
          </div>
          <div className="rounded-lg border border-gray-100 bg-white p-5">
            <p className="text-xs font-medium text-gray-500">전체 상품</p>
            <p className="mt-2 text-xl font-medium text-gray-900">{data?.productsTotal ?? 0}</p>
            <p className="mt-1 text-xs text-gray-500">승인 {data?.productsApproved ?? 0} / 대기 {data?.productsPending ?? 0}</p>
          </div>
          <div className="rounded-lg border border-gray-100 bg-white p-5">
            <p className="text-xs font-medium text-gray-500">전체 주문</p>
            <p className="mt-2 text-xl font-medium text-gray-900">{data?.ordersTotal ?? 0}</p>
            <p className="mt-1 text-xs text-gray-500">결제완료 {data?.ordersPaymentCompleted ?? 0} / 대기 {data?.ordersPaymentPending ?? 0} / 취소 {data?.ordersCancelled ?? 0}</p>
          </div>
          <div className="rounded-lg border border-gray-100 bg-white p-5">
            <p className="text-xs font-medium text-gray-500">입점업체</p>
            <p className="mt-2 text-xl font-medium text-gray-900">{data?.partnersTotal ?? 0}</p>
            <p className="mt-1 text-xs text-gray-500">승인 {data?.partnersApproved ?? 0} / 대기 {data?.partnersPending ?? 0}</p>
          </div>
        </div>
      </div>

      <div className="mt-10">
        <h2 className="text-xs font-medium uppercase tracking-wider text-gray-500">승인 관리</h2>
        <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-gray-100 bg-white p-5">
            <p className="text-xs font-medium text-gray-500">승인 대기 입점업체</p>
            <p className="mt-2 text-xl font-medium text-gray-900">{data?.partnersPending ?? 0}</p>
            <Link href="/admin/partners?status=PENDING" className="mt-3 inline-block text-sm text-gray-600 hover:text-gray-900">목록 보기 →</Link>
          </div>
          <div className="rounded-lg border border-gray-100 bg-white p-5">
            <p className="text-xs font-medium text-gray-500">승인 대기 상품</p>
            <p className="mt-2 text-xl font-medium text-gray-900">{data?.productsPending ?? 0}</p>
            <Link href="/admin/products?status=PENDING" className="mt-3 inline-block text-sm text-gray-600 hover:text-gray-900">목록 보기 →</Link>
          </div>
          <div className="rounded-lg border border-gray-100 bg-white p-5">
            <p className="text-xs font-medium text-gray-500">배너 / 추천 상품</p>
            <Link href="/admin/banners" className="mt-3 inline-block text-sm text-gray-600 hover:text-gray-900">배너 관리 →</Link>
            <Link href="/admin/curation" className="mt-1 block text-sm text-gray-600 hover:text-gray-900">고객님을 위한 상품 →</Link>
          </div>
          <div className="rounded-lg border border-gray-100 bg-white p-5">
            <p className="text-xs font-medium text-gray-500">상품 노출 순서</p>
            <Link href="/admin/products/order" className="mt-3 inline-block text-sm text-gray-600 hover:text-gray-900">순서 조정 →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
