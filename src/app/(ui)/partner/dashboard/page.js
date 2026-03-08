'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';

const PARTNER_TOKEN_KEY = 'partnerToken';

function formatMoney(n) {
  return new Intl.NumberFormat('ko-KR').format(n) + '원';
}

const CARDS = [
  { key: 'totalProducts', label: '내 상품 수', href: '/partner/products', suffix: '건' },
  { key: 'pendingProducts', label: '승인 대기 상품', href: '/partner/products', suffix: '건' },
  { key: 'monthRevenue', label: '이번 달 매출', format: true },
  { key: 'settlementPending', label: '정산 대기 금액', format: true },
];

export default function PartnerDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem(PARTNER_TOKEN_KEY) : null;
    if (!token) return;
    fetch('/api/partner/dashboard', { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        if (!res.ok) throw new Error('대시보드 조회 실패');
        return res.json();
      })
      .then(setData)
      .catch((e) => setError(e.message || '데이터를 불러올 수 없습니다.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-gray-800">대시보드</h1>
        <p className="mt-1 text-sm text-gray-500">입점업체 현황을 한눈에 확인하세요.</p>
      </div>

      <ErrorMessage message={error} />

      {data && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {CARDS.map((c) => {
            const value = data[c.key] ?? 0;
            const display = c.format ? formatMoney(value) : `${value}${c.suffix ?? ''}`;
            const content = (
              <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
                  {c.label}
                </p>
                <p className="mt-2 text-2xl font-semibold text-gray-800">{display}</p>
              </div>
            );
            return c.href ? (
              <Link key={c.key} href={c.href} className="transition-opacity hover:opacity-90">
                {content}
              </Link>
            ) : (
              <div key={c.key}>{content}</div>
            );
          })}
        </div>
      )}

      <div className="rounded-xl border border-gray-100 bg-white p-5">
        <h2 className="text-sm font-medium text-gray-700">빠른 메뉴</h2>
        <ul className="mt-3 space-y-2">
          <li>
            <Link
              href="/partner/products/new"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              상품 등록 →
            </Link>
          </li>
          <li>
            <Link href="/partner/orders" className="text-sm text-gray-600 hover:text-gray-900">
              주문 관리 →
            </Link>
          </li>
          <li>
            <Link href="/partner/settlement" className="text-sm text-gray-600 hover:text-gray-900">
              정산 내역 →
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}
