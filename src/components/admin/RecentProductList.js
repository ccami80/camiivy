'use client';

import Link from 'next/link';

/**
 * 최근 등록된 상품 리스트 (최대 5개)
 * - 썸네일, 상품명, 등록일
 */
export default function RecentProductList({ items = [], listHref }) {
  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-gray-100 bg-white p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-medium uppercase tracking-wider text-gray-500">
            최근 등록 상품
          </h2>
          {listHref && (
            <Link href={listHref} className="text-xs text-gray-500 hover:text-gray-800">
              전체 →
            </Link>
          )}
        </div>
        <p className="mt-6 text-center text-sm text-gray-500">등록된 상품이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-100 bg-white p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-medium uppercase tracking-wider text-gray-500">
          최근 등록 상품
        </h2>
        {listHref && (
          <Link href={listHref} className="text-xs text-gray-500 hover:text-gray-800">
            전체 →
          </Link>
        )}
      </div>
      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li key={item.id}>
            <Link
              href={item.href ?? `/admin/products/${item.id}`}
              className="flex items-center gap-3 rounded-md py-2 transition-colors hover:bg-gray-50"
            >
              <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded border border-gray-100 bg-gray-50">
                {item.thumbnailUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.thumbnailUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                    —
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-800">{item.name}</p>
                <p className="text-xs text-gray-500">{item.registeredAt ?? item.createdAt}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
