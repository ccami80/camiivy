'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSelector, useDispatch } from 'react-redux';
import { removeRecentlyViewedItems } from '@/redux/reducers/recentlyViewedReducer';

export default function RecentPage() {
  const items = useSelector((state) => state.recentlyViewed.items);
  const dispatch = useDispatch();
  const [selectedIds, setSelectedIds] = useState(new Set());

  const toggleOne = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === items.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(items.map((i) => i.id)));
    }
  };

  const deleteSelected = () => {
    if (selectedIds.size === 0) return;
    dispatch(removeRecentlyViewedItems([...selectedIds]));
    setSelectedIds(new Set());
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">최근 본 상품</h1>
          <p className="mt-1 text-sm text-gray-500">최근 조회한 상품 목록입니다. 선택하여 삭제할 수 있습니다.</p>
        </div>
        {items.length > 0 && (
          <div className="flex items-center gap-3">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700 hover:text-gray-900">
              <input
                type="checkbox"
                checked={items.length > 0 && selectedIds.size === items.length}
                onChange={toggleAll}
                className="sr-only"
                aria-label="전체 선택"
              />
              <span
                className={`inline-flex h-4 w-4 shrink-0 items-center justify-center rounded border ${selectedIds.size === items.length && items.length > 0 ? 'border-gray-900 bg-gray-900' : 'border-gray-300'}`}
                aria-hidden
              >
                {selectedIds.size === items.length && items.length > 0 && (
                  <svg className="h-2.5 w-2.5 text-white" fill="currentColor" viewBox="0 0 12 12">
                    <path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" />
                  </svg>
                )}
              </span>
              전체 선택
            </label>
            <button
              type="button"
              onClick={deleteSelected}
              disabled={selectedIds.size === 0}
              className="rounded-md border border-red-200 bg-white px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              선택 삭제 {selectedIds.size > 0 && `(${selectedIds.size})`}
            </button>
          </div>
        )}
      </div>
      {items.length === 0 ? (
        <p className="mt-6 text-gray-500">최근 본 상품이 없습니다.</p>
      ) : (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <li key={item.id} className="relative rounded-lg border border-gray-200 overflow-hidden bg-white">
              <label className="absolute left-3 top-3 z-10 flex cursor-pointer items-center justify-center rounded bg-white">
                <input
                  type="checkbox"
                  checked={selectedIds.has(item.id)}
                  onChange={() => toggleOne(item.id)}
                  onClick={(e) => e.stopPropagation()}
                  className="sr-only"
                  aria-label={`${item.name} 선택`}
                />
                <span
                  className={`inline-flex h-4 w-4 shrink-0 items-center justify-center rounded border ${selectedIds.has(item.id) ? 'border-gray-900 bg-gray-900' : 'border-gray-300'}`}
                  aria-hidden
                >
                  {selectedIds.has(item.id) && (
                    <svg className="h-2.5 w-2.5 text-white" fill="currentColor" viewBox="0 0 12 12">
                      <path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" />
                    </svg>
                  )}
                </span>
              </label>
              <Link href={`/products/${item.id}`} className="block">
                <div className="aspect-square bg-gray-100">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-gray-400">이미지 없음</div>
                  )}
                </div>
                <div className="p-3">
                  <p className="font-medium text-gray-900 line-clamp-2" title={item.name}>
                    {item.name}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-6">
        <Link href="/products" className="text-sm text-gray-600 hover:text-gray-900">
          ← 상품 목록으로
        </Link>
      </p>
    </div>
  );
}
