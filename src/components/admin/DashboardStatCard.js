'use client';

import Link from 'next/link';

/**
 * 대시보드 KPI 요약 카드
 * - 숫자 강조, 설명 텍스트, 클릭 시 해당 관리 페이지로 이동
 */
export default function DashboardStatCard({ value, label, href }) {
  const content = (
    <>
      <p className="text-2xl font-medium text-gray-900 md:text-3xl">{value}</p>
      <p className="mt-1 text-sm text-gray-500">{label}</p>
    </>
  );

  const className =
    'block rounded-lg border border-gray-100 bg-white p-5 text-left transition-colors hover:bg-gray-50';

  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }

  return <div className={className}>{content}</div>;
}
