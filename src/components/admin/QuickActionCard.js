'use client';

import Link from 'next/link';

/**
 * 퀵 액션 버튼 카드 (아이콘 + 텍스트)
 * - 관리자용 단정한 디자인, 과한 색상 금지
 */
function IconBox({ children }) {
  return (
    <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-gray-500">
      {children}
    </span>
  );
}

export default function QuickActionCard({ href, label, icon }) {
  const iconContent = icon ?? <span className="text-lg">→</span>;

  return (
    <Link
      href={href}
      className="flex items-center gap-4 rounded-lg border border-gray-100 bg-white p-4 transition-colors hover:bg-gray-50"
    >
      <IconBox>{iconContent}</IconBox>
      <span className="text-sm font-medium text-gray-800">{label}</span>
    </Link>
  );
}
