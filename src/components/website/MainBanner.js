'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import Link from 'next/link';

const BANNERS_PER_VIEW = 2;
const SLIDE_WIDTH = 628;
const SLIDE_HEIGHT = 442;
const SLIDE_GAP = 24;
/** 자동 재생 간격 (ms) - 롯데온 빌보드처럼 자동 로딩 */
const AUTO_PLAY_INTERVAL = 5000;

/**
 * 슬라이드 한 장: 이미지 로드 후에만 노출해 전환 시 이전 이미지가 비치지 않도록 함
 */
function BannerSlide({ banner, slideIndex, totalCount, page }) {
  const [loaded, setLoaded] = useState(false);
  const linkUrl = banner.linkUrl?.trim() || '/products';
  const label = (banner.title || '').trim();
  const body = (banner.description || '').trim();
  const onLoad = useCallback(() => setLoaded(true), []);

  return (
    <Link
      href={linkUrl}
      className="group flex flex-shrink-0 flex-col overflow-hidden rounded-lg bg-white"
      style={{ width: SLIDE_WIDTH }}
      role="group"
      aria-label={`총 ${totalCount}장의 슬라이드 배너 중 ${page * BANNERS_PER_VIEW + slideIndex + 1}번째 슬라이드 배너 입니다.`}
    >
      <div
        className="relative w-full overflow-hidden bg-gray-100"
        style={{ height: SLIDE_HEIGHT }}
      >
        {/* 로드 완료 전에는 플레이스홀더만 노출 → 전환 시 이전 이미지 비침 방지 */}
        {!loaded && (
          <div
            className="absolute inset-0 animate-pulse bg-gray-200"
            style={{ height: SLIDE_HEIGHT }}
            aria-hidden
          />
        )}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={`${banner.id}-${banner.imageUrl}`}
          src={banner.imageUrl}
          alt=""
          onLoad={onLoad}
          className={`h-full w-full object-cover transition duration-300 group-hover:scale-[1.03] ${
            loaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      </div>
      <div className="mt-4 flex flex-col items-start px-1">
        {label && (
          <span className="mb-0.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-500">
            {label}
          </span>
        )}
        <span className="line-clamp-2 text-base font-medium leading-snug text-gray-900 group-hover:text-[var(--cami-deep)]">
          {body || '자세히 보기'}
        </span>
      </div>
    </Link>
  );
}

/**
 * 메인 페이지 배너 - SSG special_adNew 스타일
 * 슬라이드 628×442px, 24px 간격, 자동 재생(롯데온 빌보드 스타일)
 */
export default function MainBanner({ banners }) {
  if (!banners?.length) return null;

  const [page, setPage] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);
  const maxPage = Math.max(0, Math.ceil(banners.length / BANNERS_PER_VIEW) - 1);
  const visible = banners.slice(
    page * BANNERS_PER_VIEW,
    page * BANNERS_PER_VIEW + BANNERS_PER_VIEW
  );

  const goPrev = () => setPage((p) => Math.max(0, p - 1));
  const goNext = () => setPage((p) => Math.min(maxPage, p + 1));

  // 자동 재생: 일정 간격으로 다음 슬라이드로 이동
  useEffect(() => {
    if (maxPage <= 0 || isPaused) return;
    timerRef.current = setInterval(() => {
      setPage((prev) => (prev >= maxPage ? 0 : prev + 1));
    }, AUTO_PLAY_INTERVAL);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [maxPage, isPaused]);

  const currentPageStr = String(page + 1).padStart(2, '0');
  const totalPageStr = String(maxPage + 1).padStart(2, '0');

  return (
    <section
      className="relative w-full overflow-hidden bg-white"
      aria-label="메인 배너"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
    >
      <div className="mx-auto w-full max-w-[1320px] px-4 py-8 md:px-6">
        <div className="relative flex items-start justify-center overflow-hidden">
          <div
            className="flex w-full justify-center overflow-hidden"
            style={{ gap: SLIDE_GAP, minHeight: SLIDE_HEIGHT }}
          >
            {visible.map((banner, slideIndex) => (
              <BannerSlide
                key={`${page}-${banner.id}`}
                banner={banner}
                slideIndex={slideIndex}
                totalCount={banners.length}
                page={page}
              />
            ))}
          </div>
        </div>

        {maxPage > 0 && (
          <div
            className="bn_n01__pagination mt-6 flex h-6 w-full max-w-[1140px] items-center justify-center gap-0 border-t border-gray-200 bg-gray-50 px-4 text-xs text-gray-600"
            style={{ height: 24 }}
            role="group"
            aria-label="이전 슬라이드 배너 현재페이지 총 페이지 다음 슬라이드 배너 정지"
          >
            <button
              type="button"
              onClick={goPrev}
              disabled={page === 0}
              className="flex items-center gap-1.5 py-1 pr-2 hover:text-gray-900 disabled:cursor-default disabled:opacity-40 disabled:hover:text-gray-600"
              aria-label="이전 슬라이드 배너"
            >
              <svg className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>이전 슬라이드 배너</span>
            </button>
            <span className="tabular-nums px-3 font-medium text-gray-700" aria-live="polite">
              현재페이지 {currentPageStr} 총 페이지 {totalPageStr}
            </span>
            <button
              type="button"
              onClick={goNext}
              disabled={page >= maxPage}
              className="flex items-center gap-1.5 py-1 pl-2 hover:text-gray-900 disabled:cursor-default disabled:opacity-40 disabled:hover:text-gray-600"
              aria-label="다음 슬라이드 배너"
            >
              <span>다음 슬라이드 배너</span>
              <svg className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => setIsPaused((p) => !p)}
              className="ml-2 flex items-center gap-1.5 border-l border-gray-200 py-1 pl-3 hover:text-gray-900"
              aria-label={isPaused ? '자동 재생' : '정지'}
            >
              {isPaused ? (
                <svg className="h-3.5 w-3.5 shrink-0" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path d="M8 5v14l11-7z" />
                </svg>
              ) : (
                <svg className="h-3.5 w-3.5 shrink-0" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                </svg>
              )}
              <span>{isPaused ? '재생' : '정지'}</span>
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
