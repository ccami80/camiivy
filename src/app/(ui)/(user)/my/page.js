'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import BreadcrumbNav from '@/components/website/BreadcrumbNav';
import {
  USE_DUMMY,
  DUMMY_ORDERS_COUNT,
  DUMMY_REVIEWS_COUNT,
  DUMMY_WISHLIST_COUNT,
  DUMMY_WISHLIST,
} from './dummyData';

const USER_TOKEN_KEY = 'userToken';

const quickLinks = [
  { href: '/my/profile', label: '회원 정보' },
  { href: '/my/pets', label: '반려동물' },
  { href: '/my/orders', label: '주문 내역' },
  { href: '/my/cancel-returns', label: '취소/교환/반품 내역' },
  { href: '/my/reviews', label: '리뷰 관리' },
  { href: '/my/inquiries', label: '나의 문의 내역' },
];

/** WishlistContext 항목을 마이페이지 찜한 상품 row 형식으로 변환 */
function wishlistContextToRows(items) {
  if (!Array.isArray(items) || items.length === 0) return [];
  return items.map((item) => ({
    id: `w-${item.id}`,
    productId: item.id,
    product: {
      id: item.id,
      name: item.name ?? '-',
      basePrice: item.basePrice ?? 0,
      imageUrl: item.imageUrl ?? null,
      images: item.imageUrl ? [{ url: item.imageUrl }] : [],
    },
  }));
}

export default function MyPage() {
  const recentlyViewedItems = useSelector((state) => state.recentlyViewed.items);
  const wishlistItems = useSelector((state) => state.wishlist.items);
  const [ordersCount, setOrdersCount] = useState(USE_DUMMY ? DUMMY_ORDERS_COUNT : 0);
  const [reviewsCount, setReviewsCount] = useState(USE_DUMMY ? DUMMY_REVIEWS_COUNT : 0);
  const [wishlistFromApi, setWishlistFromApi] = useState([]);
  const [recommendedItems, setRecommendedItems] = useState([]);
  const [loading, setLoading] = useState(true);

  /** 찜한 상품: 로컬(찜 버튼으로 담은 목록)이 있으면 우선 사용, 없으면 API 결과 사용 */
  const wishlistRows = useMemo(() => {
    const fromRedux = wishlistContextToRows(wishlistItems);
    if (fromRedux.length > 0) return fromRedux;
    return Array.isArray(wishlistFromApi) ? wishlistFromApi : [];
  }, [wishlistItems, wishlistFromApi]);
  const wishlistCount = wishlistRows.length;
  const recentCount = recentlyViewedItems.length;
  const recentItems = recentlyViewedItems;
  const [recommendedPage, setRecommendedPage] = useState(0);
  const RECOMMENDED_PER_PAGE = 4;
  const recommendedMaxPage = Math.max(0, Math.ceil(recommendedItems.length / RECOMMENDED_PER_PAGE) - 1);
  const recommendedVisible = recommendedItems.slice(
    recommendedPage * RECOMMENDED_PER_PAGE,
    recommendedPage * RECOMMENDED_PER_PAGE + RECOMMENDED_PER_PAGE
  );

  /** /recent 페이지와 동일: grid 한 칸 크기 (gap-4, 3열 기준) */
  const recentCardMinW = 'min-w-[220px]';
  const recentCardThumbSize = 'h-[220px] w-[220px]';

  useEffect(() => {
    if (recommendedPage > recommendedMaxPage && recommendedMaxPage >= 0) {
      setRecommendedPage(recommendedMaxPage);
    }
  }, [recommendedPage, recommendedMaxPage]);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem(USER_TOKEN_KEY) : null;
    if (!token) {
      setLoading(false);
      return;
    }
    const headers = { Authorization: `Bearer ${token}` };
    const fetches = [
      fetch('/api/user/wishlist', { headers }).then((r) => (r.ok ? r.json() : [])),
      fetch('/api/curation').then((r) => (r.ok ? r.json() : [])),
    ];
    if (!USE_DUMMY) {
      fetches.push(
        fetch('/api/user/orders', { headers }).then((r) => (r.ok ? r.json() : [])),
        fetch('/api/user/reviews', { headers }).then((r) => (r.ok ? r.json() : []))
      );
    }
    Promise.all(fetches)
      .then((results) => {
        const wishlist = Array.isArray(results[0]) ? results[0] : [];
        const curationProducts = Array.isArray(results[1]) ? results[1] : [];
        setWishlistFromApi(wishlist);
        setRecommendedItems(
          curationProducts.map((p) => ({
            ...p,
            imageUrl: p.images?.[0]?.url ?? null,
            discountPercent: p.discountPercent ?? 0,
          }))
        );
        if (!USE_DUMMY && results.length >= 4) {
          setOrdersCount(Array.isArray(results[2]) ? results[2].length : 0);
          setReviewsCount(Array.isArray(results[3]) ? results[3].length : 0);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center">
        <p className="text-gray-500">로딩 중…</p>
      </div>
    );
  }

  // 주문 상태 (이미지 스타일: 준비중/배송중/배송완료/취소/교환반품 — API 연동 시 실제 값으로 교체)
  const orderStatuses = [
    { label: '준비중', count: 0 },
    { label: '배송중', count: 0 },
    { label: '배송완료', count: ordersCount },
    { label: '취소', count: 0 },
    { label: '교환/반품', count: 0 },
  ];

  return (
    <div className="space-y-6">
      <BreadcrumbNav label="마이" />

      <header>
        <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl">마이</h1>
        <p className="mt-1 text-sm text-gray-500">주문 현황과 서비스 메뉴를 확인하세요.</p>
      </header>

      {/* 주문 현황 */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-700">주문 현황</h2>
          <Link
            href="/my/orders"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            상세조회
          </Link>
        </div>
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <div className="flex flex-wrap items-stretch divide-x divide-gray-200 sm:flex-nowrap">
            <div className="flex flex-1 items-center justify-center gap-1.5 bg-gray-50 px-4 py-5 sm:justify-start sm:px-5">
              <span className="text-sm font-semibold text-gray-900">주문내역</span>
              <Link href="/return-policy" className="text-gray-400 hover:text-gray-600" aria-label="주문/배송 안내">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>
            {orderStatuses.map((s) => (
              <Link
                key={s.label}
                href="/my/orders"
                className="flex min-w-0 flex-1 flex-col items-center justify-center px-3 py-5 hover:bg-gray-50/80 sm:px-4"
              >
                <span className="text-xl font-bold text-gray-900">{s.count}</span>
                <span className="mt-0.5 text-xs text-gray-500">{s.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 찜한 상품 */}
      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 sm:px-5">
          <h2 className="text-sm font-bold text-gray-900">찜한 상품</h2>
          <Link href="/my/wishlist" className="text-sm text-gray-600 hover:text-gray-900">
            전체보기 &gt;
          </Link>
        </div>
        {wishlistRows.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-gray-500 sm:px-5">
            찜한 상품이 없습니다.
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {wishlistRows.slice(0, 3).map((row) => {
              const product = row.product ?? row;
              const name = product.name ?? product.title ?? '-';
              const price = product.basePrice ?? product.price ?? product.salePrice ?? 0;
              const discountPercent = product.discountPercent ?? product.discount ?? 0;
              const imageUrl = product.images?.[0]?.url ?? product.imageUrl ?? product.image ?? '/img/cami.jpg';
              const productId = product.id ?? row.productId;
              return (
                <li key={row.id ?? productId ?? name}>
                  <Link
                    href={`/products/${productId}`}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50/80 sm:px-5"
                  >
                    <div
                      className="shrink-0 overflow-hidden rounded-lg bg-gray-100"
                      style={{ width: '80px', height: '80px' }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imageUrl || '/img/cami.jpg'}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-sm text-gray-900">{name}</p>
                      <div className="mt-1 flex items-center gap-2">
                        {discountPercent > 0 && (
                          <span className="text-sm font-semibold text-red-600">{discountPercent}%</span>
                        )}
                        <span className="text-sm font-bold text-gray-900">
                          {price.toLocaleString()}원
                        </span>
                      </div>
                      <span className="mt-1 inline-block rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                        무료배송
                      </span>
                    </div>
                    <button
                      type="button"
                      className="shrink-0 rounded p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                      aria-label="장바구니 담기"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </button>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* 최근 본 상품 */}
      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 sm:px-5">
          <h2 className="text-sm font-bold text-gray-900">최근 본 상품</h2>
          <Link href="/recent" className="text-sm text-gray-600 hover:text-gray-900">
            전체보기 &gt;
          </Link>
        </div>
        {recentItems.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-gray-500 sm:px-5">
            최근 본 상품이 없습니다.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <ul className="flex gap-4 px-4 py-4 " >
              {recentItems.slice(0, 10).map((item) => (
                <li key={item.id} className={`shrink-0 ${recentCardMinW}`}>
                  <Link
                    href={`/products/${item.id}`}
                    className="block overflow-hidden rounded-lg border border-gray-200 bg-white"
                  >
                    <div className="aspect-square w-[220px] h-[220px] overflow-hidden bg-gray-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.imageUrl || '/img/cami.jpg'}
                        alt=""
                        className="h-[220px] w-[220px] object-cover"
                      />
                    </div>
                    <div className="p-3 w-[220px]">
                      <p className="line-clamp-2 font-medium text-gray-900" title={item.name}>
                        {item.name}
                      </p>
                      {item.price != null && (
                        <p className="mt-1 text-sm font-bold text-gray-900">
                          {Number(item.price).toLocaleString()}원
                        </p>
                      )}
                      <span className="mt-1 inline-block rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600">
                        무료배송
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* 고객님을 위한 상품 */}
      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 sm:px-5">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-gray-900">고객님을 위한 상품</h2>
            <span className="rounded bg-gray-200 px-1.5 py-0.5 text-xs font-medium text-gray-600">AD</span>
          </div>
        </div>
        {recommendedItems.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-gray-500 sm:px-5">
            추천 상품이 없습니다.
          </div>
        ) : (
          <div className="relative flex items-stretch">
            {/* 왼쪽 화살표 */}
            {recommendedMaxPage > 0 && (
              <button
                type="button"
                onClick={() => setRecommendedPage((p) => Math.max(0, p - 1))}
                disabled={recommendedPage === 0}
                className="absolute left-0 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg border border-gray-300 bg-white shadow-sm hover:bg-gray-50 disabled:pointer-events-none disabled:opacity-40"
                aria-label="이전 상품"
              >
                <svg className="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            {/* 상품 목록 (한 번에 4개) */}
            <div className="flex flex-1 justify-center px-12 py-4">
              <ul className="grid w-full max-w-[960px] grid-cols-2 gap-4 sm:grid-cols-4">
                {recommendedVisible.map((item) => (
                  <li key={item.id}>
                    <Link
                      href={`/products/${item.id}`}
                      className="block overflow-hidden rounded-lg border border-gray-200 bg-white"
                    >
                      <div className="aspect-square w-full overflow-hidden bg-gray-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.imageUrl || '/img/cami.jpg'}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="p-3">
                        <p className="line-clamp-2 font-medium text-gray-900" title={item.name}>
                          {item.name}
                        </p>
                        <div className="mt-1 flex items-center gap-2">
                          {item.discountPercent > 0 && (
                            <span className="text-sm font-semibold text-red-600">{item.discountPercent}%</span>
                          )}
                          <span className="text-sm font-bold text-gray-900">
                            {Number(item.basePrice ?? item.price ?? 0).toLocaleString()}원
                          </span>
                        </div>
                        <span className="mt-1 inline-block rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600">
                          무료배송
                        </span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            {/* 오른쪽 화살표 */}
            {recommendedMaxPage > 0 && (
              <button
                type="button"
                onClick={() => setRecommendedPage((p) => Math.min(recommendedMaxPage, p + 1))}
                disabled={recommendedPage >= recommendedMaxPage}
                className="absolute right-0 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg border border-gray-300 bg-white shadow-sm hover:bg-gray-50 disabled:pointer-events-none disabled:opacity-40"
                aria-label="다음 상품"
              >
                <svg className="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>
        )}
      </section>

      {/* 바로가기 */}
      <section>
        <h2 className="mb-3 text-sm font-semibold text-gray-700">서비스 메뉴</h2>
        <ul className="flex flex-wrap gap-2">
          {quickLinks.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="inline-flex items-center rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                {item.label}
              </Link>
            </li>
          ))}
          <li>
            <Link
              href="/my/wishlist"
              className="inline-flex items-center rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              찜 목록 {wishlistCount > 0 && `(${wishlistCount})`}
            </Link>
          </li>
          <li>
            <Link
              href="/recent"
              className="inline-flex items-center rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              최근 본 상품 {recentCount > 0 && `(${recentCount})`}
            </Link>
          </li>
        </ul>
      </section>
    </div>
  );
}
