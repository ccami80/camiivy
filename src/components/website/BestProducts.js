'use client';

import Link from 'next/link';
import { useSelector, useDispatch } from 'react-redux';
import { toggleWishlistItem } from '@/redux/reducers/wishlistReducer';
import { wishlistEntryFromProduct } from '@/lib/wishlistHelpers';

function formatPrice(price) {
  return new Intl.NumberFormat('ko-KR').format(price) + '원';
}

export default function BestProducts({ products, title = '베스트 상품' }) {
  const wishlistItems = useSelector((state) => state.wishlist.items);
  const dispatch = useDispatch();
  if (!products?.length) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 py-20 md:px-6">
      <h2 className="text-center text-xs font-medium uppercase tracking-widest text-gray-400">
        {title}
      </h2>
      <ul className="mt-10 grid gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {products.map((p) => {
          const isWishlisted = wishlistItems.some((item) => item.id === String(p.id));
          const productForWishlist = wishlistEntryFromProduct({ id: p.id, name: p.name, images: p.image ? [{ url: p.image }] : [], basePrice: p.price }) || { id: p.id, name: p.name, imageUrl: p.image ?? null, basePrice: p.price };
          return (
            <li key={p.id}>
              <Link
                href={`/products/${p.id}`}
                className="group block overflow-hidden rounded-lg border border-gray-100 bg-white transition-shadow hover:shadow-sm"
              >
                <div className="relative aspect-square bg-gray-50">
                  {p.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.image}
                      alt=""
                      className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.01]"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-gray-400 text-sm">
                      —
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      dispatch(toggleWishlistItem(productForWishlist));
                    }}
                      className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm transition hover:bg-white"
                      aria-label={isWishlisted ? '찜 해제' : '찜하기'}
                    >
                      <svg
                        className={`h-5 w-5 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-300'}`}
                        fill={isWishlisted ? 'currentColor' : 'none'}
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </button>
                  </div>
                <div className="p-5">
                  <p className="text-sm font-medium text-gray-900 line-clamp-2 leading-snug">{p.name}</p>
                  <p className="mt-2 text-sm text-gray-500">
                    {formatPrice(p.price)}
                  </p>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
