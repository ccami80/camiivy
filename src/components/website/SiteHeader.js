'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import api from '@/utils/apis';
import { getBackendUri, store } from '@/utils/apiPaths';
import { clearTokens } from '@/lib/authHelpers';
import { clearAuth } from '@/redux/reducers/authReducer';

const USER_TOKEN_KEY = 'userToken';
/** 이랜드몰처럼: 첫 헤더가 화면 밖으로 나가는 순간 스티키 표시 (추가 여유 0) */
const EXTRA_SCROLL_AFTER_HEADER = 0;
/** 컴팩트 표시 기준 최소값 (측정 전/실패 시 폴백) */
const FALLBACK_HEADER_HEIGHT = 120;

export default function SiteHeader() {
  const router = useRouter();
  const dispatch = useDispatch();
  const fullHeaderRef = useRef(null);
  const [categories, setCategories] = useState([]);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [hasUser, setHasUser] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  /** 전체 헤더 높이 — 위로 스크롤 시 이 지점에서 컴팩트 숨김(겹침 방지) */
  const [headerHeight, setHeaderHeight] = useState(FALLBACK_HEADER_HEIGHT);
  /** 컴팩트 표시 기준 = 헤더 높이 + 50px */
  const showThreshold = headerHeight + EXTRA_SCROLL_AFTER_HEADER;

  useEffect(() => {
    api
      .get({ uri: getBackendUri(), path: store.categories })
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    setHasUser(typeof window !== 'undefined' && !!localStorage.getItem(USER_TOKEN_KEY));
  }, []);

  const fetchCartCount = useCallback(() => {
    api
      .get({ uri: getBackendUri(), path: store.cart })
      .then((data) => setCartCount(Array.isArray(data?.items) ? data.items.length : 0))
      .catch(() => setCartCount(0));
  }, []);

  useEffect(() => {
    fetchCartCount();
    const onCartUpdated = () => {
      // 쿠키(Set-Cookie) 반영 후 조회하도록 지연
      setTimeout(() => fetchCartCount(), 300);
    };
    window.addEventListener('cart-updated', onCartUpdated);
    return () => window.removeEventListener('cart-updated', onCartUpdated);
  }, [fetchCartCount]);

  useEffect(() => {
    const updateHeight = () => {
      const el = fullHeaderRef.current;
      if (el) setHeaderHeight(Math.round(el.getBoundingClientRect().height));
    };
    updateHeight();
    window.addEventListener('resize', updateHeight);
    const t = requestAnimationFrame(updateHeight);
    return () => {
      window.removeEventListener('resize', updateHeight);
      cancelAnimationFrame(t);
    };
  }, [categories]);

  useEffect(() => {
    const handleScroll = () => {
      if (typeof window === 'undefined') return;
      const y = window.scrollY;
      setIsScrolled((prev) => {
        if (prev) return y > headerHeight;
        return y >= showThreshold;
      });
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [headerHeight, showThreshold]);

  const byPet = { DOG: [], CAT: [] };
  categories.forEach((c) => {
    if (byPet[c.petType]) byPet[c.petType].push(c);
  });

  function buildCategoryTree(list, petType) {
    const filtered = (list || []).filter((c) => c.petType === petType);
    const roots = filtered.filter((c) => !c.parentId).sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    const childrenByParentId = {};
    filtered.filter((c) => c.parentId).forEach((c) => {
      if (!childrenByParentId[c.parentId]) childrenByParentId[c.parentId] = [];
      childrenByParentId[c.parentId].push(c);
    });
    Object.keys(childrenByParentId).forEach((pid) => {
      childrenByParentId[pid].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    });
    return { roots, childrenByParentId };
  }

  const treeDOG = buildCategoryTree(categories, 'DOG');

  const CategoryMegaPanel = ({ onClose, className = '' }) => (
    <div className={className}>
      <div className="mx-auto max-w-6xl px-4 py-6">
        {!(byPet.DOG?.length > 0) ? (
          <p className="py-4 text-center text-sm text-gray-500">카테고리 없음</p>
        ) : (
        <>
        <div>
         
          <div className="flex flex-wrap gap-x-6 gap-y-1">
            {treeDOG.roots.length > 0 ? (
              treeDOG.roots.map((root) => (
                <div key={root.id} className="mb-3">
                  <Link
                    href={`/products?petType=DOG&brand=CAMI&categoryId=${root.id}`}
                    className="text-sm font-medium text-gray-800 hover:text-gray-600"
                    onClick={onClose}
                  >
                    {root.name}
                  </Link>
                  {(treeDOG.childrenByParentId[root.id] || []).length > 0 && (
                    <ul className="mt-1 space-y-0.5 pl-0">
                      {(treeDOG.childrenByParentId[root.id] || []).map((child) => (
                        <li key={child.id}>
                          <Link
                            href={`/products?petType=DOG&brand=CAMI&categoryId=${child.id}`}
                            className="text-sm text-gray-600 hover:text-gray-900"
                            onClick={onClose}
                          >
                            {child.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))
            ) : (
              byPet.DOG.map((c) => (
                <Link
                  key={c.id}
                  href={`/products?petType=DOG&brand=CAMI&categoryId=${c.id}`}
                  className="block text-sm text-gray-600 hover:text-gray-900"
                  onClick={onClose}
                >
                  {c.name}
                </Link>
              ))
            )}
          </div>
        </div>
        <p className="mt-4 text-center text-xs text-gray-400">원하는 카테고리를 클릭하면 상품 목록으로 이동합니다.</p>
        </>
        )}
      </div>
    </div>
  );

  const handleSearch = (e) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) {
      alert('검색어를 넣어주세요.');
      return;
    }
    window.location.href = `/products?q=${encodeURIComponent(q)}`;
  };

  const showCategoryInFull = !isScrolled && categoryOpen;

  const compactHeader = (
    <div className="fixed left-0 right-0 top-0 z-50 overflow-hidden">
      <div className="header-slide-down border-b border-gray-200 bg-white shadow-md">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-2.5">
          <Link href="/" className="shrink-0 text-lg font-bold tracking-tight text-gray-900">
            CAMI
          </Link>
          <form onSubmit={handleSearch} className="flex flex-1 items-center max-w-md">
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="상품 검색"
              className="w-full border-b border-gray-300 bg-transparent py-1.5 pr-8 text-sm outline-none placeholder:text-gray-400 focus:border-gray-900"
              aria-label="상품 검색"
            />
            <button type="submit" className="-ml-6 flex h-8 w-8 items-center justify-center text-gray-500 hover:text-gray-900" aria-label="검색">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </form>
          <nav className="flex shrink-0 items-center gap-1 text-xs text-gray-600">
            <Link href="/login" className="whitespace-nowrap px-2 py-1 hover:text-gray-900">로그인</Link>
            <span className="text-gray-300">|</span>
            <Link href="/signup" className="whitespace-nowrap px-2 py-1 hover:text-gray-900">회원가입</Link>
            <span className="text-gray-300">|</span>
            <Link href="/order-inquiry" className="whitespace-nowrap px-2 py-1 hover:text-gray-900">고객센터</Link>
            <span className="text-gray-300">|</span>
            <Link href="/my/wishlist" className="whitespace-nowrap px-2 py-1 hover:text-gray-900">나의 찜목록</Link>
            <span className="text-gray-300">|</span>
            <Link href="/my" className="whitespace-nowrap px-2 py-1 hover:text-gray-900">마이페이지</Link>
            <span className="text-gray-300">|</span>
            <Link href="/order-inquiry" className="whitespace-nowrap px-2 py-1 hover:text-gray-900">주문배송</Link>
            <span className="text-gray-300">|</span>
            <Link href="/cart" className="relative inline-flex whitespace-nowrap px-2 py-1 hover:text-gray-900">
              장바구니
              {cartCount > 0 && (
                <span className="ml-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>
          </nav>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* 1. 전체 헤더: 문서 흐름만, 스크롤하면 위로 사라짐 (sticky 없음) */}
      <header ref={fullHeaderRef} className="border-b border-gray-200 bg-white">
      {/* 상단: 로그아웃 | 마이페이지 | 고객센터 (로그인 시) / 로그인 | 회원가입 | 고객센터 */}
      <div className="flex justify-end border-b border-gray-100 px-4 py-1.5">
        <nav className="flex items-center gap-4 text-xs text-gray-700">
          {hasUser ? (
            <>
              <button
                type="button"
                onClick={() => {
                  dispatch(clearAuth());
                  clearTokens();
                  setHasUser(false);
                  router.replace('/');
                  router.refresh();
                }}
                className="hover:text-gray-900"
              >
                로그아웃
              </button>
              <Link href="/my" className="hover:text-gray-900">마이페이지</Link>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-gray-900">로그인</Link>
              <Link href="/signup" className="hover:text-gray-900">회원가입</Link>
            </>
          )}
          <Link href="/order-inquiry" className="hover:text-gray-900">고객센터</Link>
        </nav>
      </div>

      {/* 메인: 로고 | 검색바 | 아이콘 */}
      <div className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-4">
        <Link href="/" className="flex shrink-0 items-center gap-1" aria-label="홈">
          <span className="text-xl font-bold tracking-tight text-gray-900">CAMI</span>

        </Link>

        <form onSubmit={handleSearch} className="flex flex-1 items-center max-w-xl mx-auto">
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="상품 검색"
            className="w-full border-b border-gray-900 bg-transparent py-2 pr-10 text-sm outline-none placeholder:text-gray-400"
            aria-label="상품 검색"
          />
          <button
            type="submit"
            className="-ml-8 flex h-8 w-8 items-center justify-center text-gray-500 hover:text-gray-900"
            aria-label="검색"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </form>

        <nav className="flex shrink-0 items-center gap-4">
          <Link
            href="/my/wishlist"
            className="flex h-9 w-9 items-center justify-center text-gray-600 hover:text-gray-900"
            aria-label="찜 목록"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </Link>
          <Link
            href="/my"
            className="flex h-9 w-9 items-center justify-center text-gray-600 hover:text-gray-900"
            aria-label="마이페이지"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </Link>
          <Link
            href="/cart"
            className="relative flex h-9 w-9 items-center justify-center text-gray-600 hover:text-gray-900"
            aria-label={cartCount > 0 ? `장바구니 ${cartCount}개` : '장바구니'}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            {cartCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </Link>
        </nav>
      </div>

      {/* 하단 네비: 전체 카테고리 보기 | 홈 | 베스트 | ... */}
      <div className="relative border-t border-gray-100">
        <div className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-2.5">
          <button
            type="button"
            onClick={() => setCategoryOpen((v) => !v)}
            className="flex items-center gap-1.5 rounded px-2 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900"
            aria-expanded={showCategoryInFull}
            aria-haspopup="true"
          >
            <svg className="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            전체 카테고리 보기
            <svg className={`h-4 w-4 text-gray-500 transition-transform ${showCategoryInFull ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <nav className="pl-6 flex items-center gap-5 text-sm text-gray-600">
            <Link href="/" className="px-2 py-1 hover:text-gray-900">홈</Link>
            {/* <span className="text-gray-300">|</span> */}
            <Link href="/best" className="px-2 py-1 hover:text-gray-900">베스트</Link>
            {/* <span className="text-gray-300">|</span> */}
            <Link href="/new" className="px-2 py-1 hover:text-gray-900">신상품</Link>
            {/* <span className="text-gray-300">|</span> */}
            <Link href="/brand" className="px-2 py-1 hover:text-gray-900">브랜드</Link>
            {/* <span className="text-gray-300">|</span> */}
            <Link href="/body-style" className="px-2 py-1 hover:text-gray-900">체형별 스타일</Link>
            {/* <span className="text-gray-300">|</span> */}
            <Link href="/with-butler" className="px-2 py-1 hover:text-gray-900">집사와 함께</Link>
          </nav>
        </div>
        {showCategoryInFull && (
          <>
            <div className="fixed inset-0 z-10" aria-hidden onClick={() => setCategoryOpen(false)} />
            <div className="absolute left-0 right-0 top-full z-20 border-x border-b border-gray-200 bg-white shadow-lg">
              <CategoryMegaPanel onClose={() => setCategoryOpen(false)} />
            </div>
          </>
        )}
      </div>
    </header>

      {/* 2. 스크롤 시: 전체 헤더가 사라진 뒤 컴팩트 헤더가 위에서 슬라이드 인 */}
      {isScrolled && compactHeader}
    </>
  );
}
