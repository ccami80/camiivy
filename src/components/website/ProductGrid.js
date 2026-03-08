'use client';

import Link from 'next/link';
import { useSelector, useDispatch } from 'react-redux';
import { toggleWishlistItem } from '@/redux/reducers/wishlistReducer';
import { wishlistEntryFromProduct } from '@/lib/wishlistHelpers';

const brandLabel = { CAMI: '까미', IVY: '아이비' };
const petLabel = { DOG: '강아지', CAT: '고양이' };

function HeartIcon({ filled }) {
  return (
    <svg
      className={`h-5 w-5 ${filled ? 'fill-red-500 text-red-500' : 'text-gray-300'}`}
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
      />
    </svg>
  );
}

export default function ProductGrid({ products = [], emptyMessage = '노출 중인 상품이 없습니다.' }) {
  const wishlistItems = useSelector((state) => state.wishlist.items);
  const dispatch = useDispatch();

  if (products.length === 0) {
    return (
      <p className="py-12 text-center text-gray-500">{emptyMessage}</p>
    );
  }
  return (
    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((p) => {
        const isWishlisted = wishlistItems.some((item) => item.id === String(p.id));
        return (
          <li key={p.id}>
            <Link
              href={`/products/${p.id}`}
              className="block overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm hover:border-gray-300"
            >
              <div className="relative aspect-square w-full bg-gray-100">
                {p.images?.[0]?.url ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={p.images[0].url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-gray-400">
                    이미지 없음
                  </div>
                )}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    dispatch(toggleWishlistItem(wishlistEntryFromProduct(p) || { id: p.id, name: p.name, imageUrl: p.images?.[0]?.url ?? null, basePrice: p.basePrice }));
                  }}
                  className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm transition hover:bg-white"
                  aria-label={isWishlisted ? '찜 해제' : '찜하기'}
                >
                  <HeartIcon filled={isWishlisted} />
                </button>
              </div>
              <div className="p-4">
                <p className="font-medium text-gray-900">{p.name}</p>
                <p className="mt-1 text-sm text-gray-500">
                  {brandLabel[p.brand] || p.brand} / {petLabel[p.petType] || p.petType}
                  {p.category?.name && ` · ${p.category.name}`}
                </p>
                <p className="mt-2 text-lg font-semibold text-gray-900">
                  {p.basePrice?.toLocaleString()}원
                </p>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
