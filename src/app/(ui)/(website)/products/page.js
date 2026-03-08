'use client';

import { useEffect, useState, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSelector, useDispatch } from 'react-redux';
import { toggleWishlistItem } from '@/redux/reducers/wishlistReducer';
import { wishlistEntryFromProduct } from '@/lib/wishlistHelpers';
import { BreadcrumbBlock } from '@/components/website/BreadcrumbNav';
import api from '@/utils/apis';
import { getBackendUri, store } from '@/utils/apiPaths';

const petLabel = { DOG: '강아지', CAT: '고양이' };

// 카테고리 트리 만드는 함수
function buildCategoryTree(categories, petType) {
  const list = (categories || []).filter((c) => c.petType === petType);
  const roots = list.filter((c) => !c.parentId).sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  const childrenByParentId = {};
  list.filter((c) => c.parentId).forEach((c) => {
    if (!childrenByParentId[c.parentId]) childrenByParentId[c.parentId] = [];
    childrenByParentId[c.parentId].push(c);
  });
  Object.keys(childrenByParentId).forEach((pid) => {
    childrenByParentId[pid].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  });
  return { roots, childrenByParentId };
}

// 가격 구간
const PRICE_RANGES = [
  { label: '전체', minPrice: '', maxPrice: '' },
  { label: '5천원 이하', minPrice: '', maxPrice: '5000' },
  { label: '5천원~1만원', minPrice: '5000', maxPrice: '10000' },
  { label: '1만원~2만원', minPrice: '10000', maxPrice: '20000' },
  { label: '2만원~3만원', minPrice: '20000', maxPrice: '30000' },
  { label: '3만원~5만원', minPrice: '30000', maxPrice: '50000' },
  { label: '5만원~10만원', minPrice: '50000', maxPrice: '100000' },
  { label: '10만원 이상', minPrice: '100000', maxPrice: '' },
];

// 상품 목록 화면 컴포넌트
function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const brand = searchParams.get('brand') || '';
  const petType = searchParams.get('petType') || '';
  const categoryId = searchParams.get('categoryId') || '';
  const sortParam = searchParams.get('sort') || 'latest';
  const sort = sortParam === 'price_asc' ? 'price-asc' : sortParam === 'price_desc' ? 'price-desc' : sortParam;
  const q = searchParams.get('q') || '';
  const minPriceParam = searchParams.get('minPrice') || '';
  const maxPriceParam = searchParams.get('maxPrice') || '';

  const SORT_OPTIONS = [
    { value: 'popular', label: '인기순' },
    { value: 'price-asc', label: '낮은가격순' },
    { value: 'price-desc', label: '높은가격순' },
    { value: 'latest', label: '신규순' },
    { value: 'sales', label: '판매량순' },
  ];

  const [list, setList] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [priceMinInput, setPriceMinInput] = useState('');
  const [priceMaxInput, setPriceMaxInput] = useState('');

  useEffect(() => {
    setPriceMinInput(minPriceParam);
    setPriceMaxInput(maxPriceParam);
  }, [minPriceParam, maxPriceParam]);

  useEffect(() => {
    setLoading(true);
    setError('');
    const params = new URLSearchParams();
    if (brand) params.set('brand', brand);
    if (petType) params.set('petType', petType);
    if (categoryId) params.set('categoryId', categoryId);
    if (sort) params.set('sort', sort);
    if (q) params.set('q', q);
    if (minPriceParam) params.set('minPrice', minPriceParam);
    if (maxPriceParam) params.set('maxPrice', maxPriceParam);
    const path = params.toString() ? `${store.products}?${params.toString()}` : store.products;
    api
      .get({ uri: getBackendUri(), path })
      .then(setList)
      .catch(() => setError('상품 목록을 불러올 수 없습니다.'))
      .finally(() => setLoading(false));
  }, [brand, petType, categoryId, sort, q, minPriceParam, maxPriceParam]);

  useEffect(() => {
    const path = petType ? `${store.categories}?petType=${petType}` : store.categories;
    api
      .get({ uri: getBackendUri(), path })
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => setCategories([]));
  }, [petType]);

  useEffect(() => {
    api
      .get({ uri: getBackendUri(), path: store.brands })
      .then((data) => setBrands(Array.isArray(data) ? data : []))
      .catch(() => setBrands([]));
  }, []);

  function buildQuery(overrides = {}) {
    const params = new URLSearchParams(searchParams);
    Object.entries(overrides).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    const str = params.toString();
    return str ? `?${str}` : '';
  }

  // 카테고리 트리, 현재 선택된 루트(대분류), 하위 목록
  const tree = useMemo(() => buildCategoryTree(categories, petType), [categories, petType]);
  const currentCategory = useMemo(() => categories.find((c) => c.id === categoryId), [categories, categoryId]);
  const selectedRootId = useMemo(() => {
    if (!currentCategory) return null;
    let cur = currentCategory;
    while (cur?.parentId) {
      const parent = categories.find((c) => c.id === cur.parentId);
      if (!parent) break;
      cur = parent;
    }
    return cur?.id ?? null;
  }, [categories, currentCategory]);
  const subCategories = useMemo(
    () => (selectedRootId ? tree.childrenByParentId[selectedRootId] || [] : []),
    [tree.childrenByParentId, selectedRootId]
  );

  const wishlistItems = useSelector((state) => state.wishlist.items);
  const dispatch = useDispatch();
  const BRAND_OPTIONS = useMemo(
    () => [
      { brand: '', petType: '', label: '전체' },
      ...brands.map((b) => ({ brand: b, petType: 'DOG', label: b })),
    ],
    [brands]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-500">로딩 중…</p>
      </div>
    );
  }

  const isSearchMode = q.trim() !== '';
  const pageTitle = isSearchMode
    ? `'${q.trim()}' 검색결과`
    : (currentCategory ? currentCategory.name : '상품');
  const pageDescription = isSearchMode
    ? `'${q.trim()}'에 대한 검색 결과입니다.`
    : currentCategory
      ? `${currentCategory.name} 카테고리의 상품입니다. 승인 완료된 상품만 노출됩니다.`
      : '승인 완료된 상품만 노출됩니다. 비승인·반려 상품은 표시되지 않습니다.';

  return (
    <>
      <div className="mx-auto max-w-6xl px-4 pb-8 pt-8  ">
        {/* 상단: 제목 + 브레드크럼 (이미지 스타일) */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 pb-4">
          <h1 className="text-2xl font-bold text-gray-900">{pageTitle}</h1>
          <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm text-gray-500">
            <Link href="/" className="hover:text-gray-900">홈</Link>
            <span aria-hidden>&gt;</span>
            <span>{petType ? petLabel[petType] || petType : '상품'}</span>
            {currentCategory && (
              <>
                <span aria-hidden>&gt;</span>
                <span className="font-semibold text-gray-900">{currentCategory.name}</span>
              </>
            )}
          </nav>
        </div>
        <p className="mt-2 text-sm text-gray-500">
          {pageDescription}
        </p>

        {/* 대분류 / 하위메뉴 두 줄 (10x10 스타일) — 카테고리를 사이드에서 분리 */}
        {!isSearchMode && tree.roots.length > 0 && (
          <div className="mt-6 space-y-3">
            {/* 1행: 대분류 (전체 + 루트 카테고리) */}
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/products${buildQuery({ categoryId: '' })}`}
                className={`rounded-full px-5 py-2.5 text-sm font-medium transition-colors ${
                  !categoryId
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                전체
              </Link>
              {tree.roots.map((c) => {
                const isActive = selectedRootId === c.id;
                return (
                  <Link
                    key={c.id}
                    href={`/products${buildQuery({ categoryId: c.id })}`}
                    className={`rounded-full px-5 py-2.5 text-sm font-medium transition-colors ${
                      isActive ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                  >
                    {c.name}
                  </Link>
                );
              })}
            </div>
            {/* 2행: 하위메뉴 (선택된 대분류의 자식) — 활성화는 글씨 색 + 언더라인만 */}
            {selectedRootId && subCategories.length > 0 && (
              <div className="mt-0 rounded-lg bg-gray-100 px-4 py-3">
                <div className="flex flex-wrap items-center gap-6">
                  <Link
                    href={`/products${buildQuery({ categoryId: selectedRootId })}`}
                    className={`text-sm font-medium transition-colors ${
                      categoryId === selectedRootId
                        ? 'text-gray-900 font-semibold underline underline-offset-4'
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    전체
                  </Link>
                  {subCategories.map((c) => {
                    const isActive = categoryId === c.id;
                    return (
                      <Link
                        key={c.id}
                        href={`/products${buildQuery({ categoryId: c.id })}`}
                        className={`text-sm font-medium transition-colors ${
                          isActive ? 'text-gray-900 font-semibold underline underline-offset-4' : 'text-gray-500 hover:text-gray-900'
                        }`}
                      >
                        {c.name}
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-8 flex gap-8">
          {/* 왼쪽: 브랜드 + 가격만 (카테고리는 상단으로 이동) */}
          {BRAND_OPTIONS.length > 0 && (
            <aside className="w-56 shrink-0 space-y-6 border-r border-gray-200 pr-6">
              <div>
                <h2 className="border-t border-gray-200 pt-4 text-sm font-semibold text-gray-900 first:border-0 first:pt-0">
                  브랜드
                </h2>
                <ul className="mt-3 space-y-2">
                  {BRAND_OPTIONS.map((opt) => {
                    const isActive = (opt.brand === brand && opt.petType === petType) || (!opt.brand && !brand && !petType);
                    return (
                      <li key={opt.brand + opt.petType || 'all'}>
                        <Link
                          href={`/products${buildQuery({ brand: opt.brand, petType: opt.petType, categoryId: categoryId || undefined })}`}
                          className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900"
                        >
                          <span
                            className={`inline-flex h-4 w-4 shrink-0 items-center justify-center rounded border ${isActive ? 'border-gray-900 bg-gray-900' : 'border-gray-300'}`}
                            aria-hidden
                          >
                            {isActive && (
                              <svg className="h-2.5 w-2.5 text-white" fill="currentColor" viewBox="0 0 12 12">
                                <path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" />
                              </svg>
                            )}
                          </span>
                          {opt.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
              {/* 가격 필터 */}
              <div>
                <h2 className="border-t border-gray-200 pt-4 text-sm font-semibold text-gray-900">가격</h2>
                <div className="mt-3 space-y-3">
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min={0}
                      placeholder="최소"
                      value={priceMinInput}
                      onChange={(e) => setPriceMinInput(e.target.value)}
                      className="w-20 rounded border border-gray-300 px-2 py-1.5 text-sm"
                    />
                    <span className="text-gray-400">~</span>
                    <input
                      type="number"
                      min={0}
                      placeholder="최대"
                      value={priceMaxInput}
                      onChange={(e) => setPriceMaxInput(e.target.value)}
                      className="w-24 rounded border border-gray-300 px-2 py-1.5 text-sm"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const q = buildQuery({
                        minPrice: priceMinInput || undefined,
                        maxPrice: priceMaxInput || undefined,
                      });
                      router.push(`/products${q}`);
                    }}
                    className="flex w-full items-center justify-center gap-1.5 rounded-md bg-gray-800 py-2 text-sm font-medium text-white hover:bg-gray-700"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    적용하기
                  </button>
                  <ul className="space-y-2">
                    {PRICE_RANGES.map((r) => {
                      const isActive =
                        (minPriceParam === r.minPrice && maxPriceParam === r.maxPrice) ||
                        (!r.minPrice && !r.maxPrice && !minPriceParam && !maxPriceParam);
                      return (
                        <li key={r.label}>
                          <Link
                            href={`/products${buildQuery({
                              minPrice: r.minPrice || undefined,
                              maxPrice: r.maxPrice || undefined,
                            })}`}
                            className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900"
                          >
                            <span
                              className={`inline-flex h-4 w-4 shrink-0 items-center justify-center rounded border ${isActive ? 'border-gray-900 bg-gray-900' : 'border-gray-300'}`}
                              aria-hidden
                            >
                              {isActive && (
                                <svg className="h-2.5 w-2.5 text-white" fill="currentColor" viewBox="0 0 12 12">
                                  <path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" />
                                </svg>
                              )}
                            </span>
                            {r.label}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            </aside>
          )}

          {/* 오른쪽: 상품 목록 및 정렬 */}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap justify-between items-center gap-x-4 gap-y-2 border-b border-gray-200 pb-3">
              <span className="text-sm text-gray-500">총 {list.length}개</span>
              <nav className="flex flex-wrap items-center gap-x-4 gap-y-1" aria-label="정렬">
                {SORT_OPTIONS.map((opt) => (
                  <Link
                    key={opt.value}
                    href={`/products${buildQuery({ sort: opt.value })}`}
                    className={`text-sm ${sort === opt.value ? 'font-semibold text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
                  >
                    {opt.label}
                  </Link>
                ))}
              </nav>
            </div>
            {error && (
              <div className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700" role="alert">
                {error}
              </div>
            )}
            <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {list.length === 0 ? (
                <li className="col-span-full py-12 text-center flex flex-col items-center justify-center">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" aria-hidden className="mx-auto mb-3">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22ZM11 8C11 7.44772 11.4477 7 12 7C12.5523 7 13 7.44772 13 8V13C13 13.5523 12.5523 14 12 14C11.4477 14 11 13.5523 11 13V8ZM13 16C13 16.5523 12.5523 17 12 17C11.4477 17 11 16.5523 11 16C11 15.4477 11.4477 15 12 15C12.5523 15 13 15.4477 13 16Z" fill="#E5E7EB"/>
                  </svg>
                  <p className="text-gray-700 font-medium">
                    {isSearchMode ? '검색결과가 없습니다.' : '노출 중인 상품이 없습니다.'}
                  </p>
                  {isSearchMode && (
                    <p className="mt-2 text-sm text-gray-500">다른 검색어로 검색해 보세요.</p>
                  )}
                </li>
              ) : (
                list.map((p) => {
                  const isWishlisted = wishlistItems.some((item) => item.id === String(p.id));
                  return (
                    <li key={p.id}>
                      <Link
                        href={`/products/${p.id}`}
                        className="block overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm hover:border-gray-300"
                      >
                        <div className="relative aspect-square w-full bg-gray-100">
                          {p.images?.[0]?.url ? (
                            // eslint-disable-next-line @next/next/no-img-element
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
                        <div className="p-4">
                          <p className="font-medium text-gray-900">{p.name}</p>
                          <p className="mt-1 text-sm text-gray-500">
                            {p.brand || ''}{p.petType ? ` / ${petLabel[p.petType] || p.petType}` : ''}
                            {p.category?.name && ` · ${p.category.name}`}
                          </p>
                          <p className="mt-2 text-lg font-semibold text-gray-900">
                            {p.basePrice?.toLocaleString()}원
                          </p>
                        </div>
                      </Link>
                    </li>
                  );
                })
              )}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-12">
          <p className="text-gray-500">로딩 중…</p>
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
