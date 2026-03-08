'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSelector, useDispatch } from 'react-redux';
import { removeWishlistItems } from '@/redux/reducers/wishlistReducer';

/** WishlistContext 항목을 페이지에서 쓰는 리스트 형식으로 변환 */
function toListItems(items) {
  return items.map((w) => ({
    id: w.id,
    productId: w.id,
    product: {
      id: w.id,
      name: w.name,
      images: w.imageUrl ? [{ url: w.imageUrl }] : [],
      basePrice: w.basePrice,
    },
  }));
}

export default function WishlistPage() {
  const wishlistItems = useSelector((state) => state.wishlist.items);
  const dispatch = useDispatch();
  const list = toListItems(wishlistItems);
  const [removing, setRemoving] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());

  const toggleOne = (productId) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) next.delete(productId);
      else next.add(productId);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === list.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(list.map((w) => w.productId)));
    }
  };

  function removeSelected() {
    const ids = [...selectedIds];
    if (ids.length === 0) return;
    setRemoving(true);
    dispatch(removeWishlistItems(ids));
    setSelectedIds(new Set());
    setRemoving(false);
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">찜 목록</h1>
          <p className="mt-1 text-sm text-gray-500">상품 상세 페이지에서 찜하기를 누르면 여기에 담깁니다.</p>
        </div>
        {list.length > 0 && (
          <div className="flex items-center gap-3">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700 hover:text-gray-900">
              <input
                type="checkbox"
                checked={list.length > 0 && selectedIds.size === list.length}
                onChange={toggleAll}
                className="sr-only"
                aria-label="전체 선택"
              />
              <span
                className={`inline-flex h-4 w-4 shrink-0 items-center justify-center rounded border ${selectedIds.size === list.length && list.length > 0 ? 'border-gray-900 bg-gray-900' : 'border-gray-300'}`}
                aria-hidden
              >
                {selectedIds.size === list.length && list.length > 0 && (
                  <svg className="h-2.5 w-2.5 text-white" fill="currentColor" viewBox="0 0 12 12">
                    <path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" />
                  </svg>
                )}
              </span>
              전체 선택
            </label>
            <button
              type="button"
              onClick={removeSelected}
              disabled={selectedIds.size === 0 || removing}
              className="rounded-md border border-red-200 bg-white px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {removing ? '삭제 중…' : `찜 해제${selectedIds.size > 0 ? ` (${selectedIds.size})` : ''}`}
            </button>
          </div>
        )}
      </div>
      {list.length === 0 ? (
        <p className="mt-6 text-gray-500">찜한 상품이 없습니다.</p>
      ) : (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((w) => (
            <li key={w.id} className="relative rounded-lg border border-gray-200 overflow-hidden bg-white">
              <label className="absolute left-3 top-3 z-10 flex cursor-pointer items-center justify-center rounded bg-white">
                <input
                  type="checkbox"
                  checked={selectedIds.has(w.productId)}
                  onChange={() => toggleOne(w.productId)}
                  onClick={(e) => e.stopPropagation()}
                  className="sr-only"
                  aria-label={`${w.product?.name ?? ''} 선택`}
                />
                <span
                  className={`inline-flex h-4 w-4 shrink-0 items-center justify-center rounded border ${selectedIds.has(w.productId) ? 'border-gray-900 bg-gray-900' : 'border-gray-300'}`}
                  aria-hidden
                >
                  {selectedIds.has(w.productId) && (
                    <svg className="h-2.5 w-2.5 text-white" fill="currentColor" viewBox="0 0 12 12">
                      <path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" />
                    </svg>
                  )}
                </span>
              </label>
              <Link href={`/products/${w.product?.id}`} className="block">
                <div className="aspect-square bg-gray-100">
                  {w.product?.images?.[0]?.url ? (
                    <img src={w.product.images[0].url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-gray-400">이미지 없음</div>
                  )}
                </div>
                <div className="p-3">
                  <p className="font-medium text-gray-900 line-clamp-2">{w.product?.name}</p>
                  <p className="mt-1 text-sm font-medium text-gray-700">{w.product?.basePrice?.toLocaleString()}원</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
