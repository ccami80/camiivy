'use client';

import Link from 'next/link';

/**
 * 최근 승인 요청 리스트
 * - 입점업체명 or 상품명, 상태(대기)
 */
export default function RecentApprovalList({ items = [], partnersHref, productsHref }) {
  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-gray-100 bg-white p-6">
        <h2 className="text-xs font-medium uppercase tracking-wider text-gray-500">
          최근 승인 요청
        </h2>
        <p className="mt-6 text-center text-sm text-gray-500">승인 대기 항목이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-100 bg-white p-5">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-xs font-medium uppercase tracking-wider text-gray-500">
          최근 승인 요청
        </h2>
        <div className="flex gap-2">
          {partnersHref && (
            <Link href={partnersHref} className="text-xs text-gray-500 hover:text-gray-800">
              입점업체 →
            </Link>
          )}
          {productsHref && (
            <Link href={productsHref} className="text-xs text-gray-500 hover:text-gray-800">
              상품 →
            </Link>
          )}
        </div>
      </div>
      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li key={item.id}>
            <Link
              href={item.href}
              className="flex items-center justify-between rounded-md py-2 transition-colors hover:bg-gray-50"
            >
              <span className="truncate text-sm text-gray-800">
                {item.type === 'partner' ? item.partnerName : item.productName}
              </span>
              <span className="ml-2 flex-shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                {item.statusLabel ?? '대기'}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
