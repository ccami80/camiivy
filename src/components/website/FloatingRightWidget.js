'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSelector } from 'react-redux';

const SCROLL_THRESHOLD = 300;

export default function FloatingRightWidget() {
  const pathname = usePathname();
  const items = useSelector((state) => state.recentlyViewed.items);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const isHome = pathname === '/';

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > SCROLL_THRESHOLD);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const showRecent = !isHome;

  return (
    <div
      className="fixed right-4 bottom-6 z-40 flex items-center gap-2"
      aria-hidden
    >
      {showRecent && (
        <Link
          href="/recent"
          className={`flex items-center gap-2 rounded-[80px] border border-[#222] bg-white pl-5 py-2.5 shadow-md transition-shadow hover:shadow-lg ${items.length === 0 ? 'pr-5' : 'pr-2.5'}`}
          aria-label="최근 본 상품 보기"
        >
          <span className="whitespace-nowrap text-sm font-medium text-gray-700">
            최근본상품 ({items.length})
          </span>
          {items.length > 0 && (
            <div className="flex -space-x-3">
              {items.slice(0, 3).map((item) => (
                <span
                  key={item.id}
                  className="relative block h-9 w-9 shrink-0 overflow-hidden rounded-full outline outline-4 outline-[#fff] bg-gray-100 ring-1 ring-gray-200"
                >
                  {item.imageUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={item.imageUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-xs text-gray-400">?</span>
                  )}
                </span>
              ))}
            </div>
          )}
        </Link>
      )}
      <button
        type="button"
        onClick={scrollToTop}
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-md transition-all hover:bg-gray-50 hover:shadow-lg ${
          showScrollTop ? 'opacity-100' : 'opacity-50'
        }`}
        aria-label="맨 위로"
        title="맨 위로"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </button>
    </div>
  );
}
