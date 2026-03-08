'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import SiteHeader from '@/components/website/SiteHeader';
import SiteFooter from '@/components/website/SiteFooter';
import FloatingRightWidget from '@/components/website/FloatingRightWidget';
import { USE_DUMMY, DUMMY_USER } from './my/dummyData';

const USER_TOKEN_KEY = 'userToken';

export default function UserLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState(USE_DUMMY ? DUMMY_USER : null);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem(USER_TOKEN_KEY) : null;
    if (!token) {
      router.replace(`/login?next=${encodeURIComponent(pathname || '/my')}`);
      return;
    }
    if (USE_DUMMY) return;
    fetch('/api/user/me', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => (r.ok ? r.json() : null))
      .then(setUser);
  }, [pathname, router]);

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto flex max-w-5xl gap-8 px-4 py-8">
          <aside className="sticky top-20 w-56 shrink-0 space-y-4 self-start">
            {/* 프로필 카드: 마이페이지 모든 화면에서 메뉴 위에 고정 */}
            <div className="rounded-xl bg-[#374151] px-6 py-8 text-center shadow-md">
              <div className="relative mx-auto inline-block">
                <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-gray-500/80">
                  {user?.profileImageUrl ? (
                    <img src={user.profileImageUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <svg className="h-12 w-12 text-white/80" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                  )}
                </div>
                <Link
                  href="/my/profile"
                  className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-[#1f2937] text-white shadow hover:bg-[#111827]"
                  aria-label="프로필 수정"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </Link>
              </div>
              <p className="mt-4 text-lg font-bold text-white">{user?.name ? `${user.name}님` : '회원'}</p>
              <Link
                href="/my/profile"
                className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-500 px-4 py-1.5 text-sm font-medium text-white hover:bg-emerald-600"
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-xs font-bold">F</span>
                프렌즈 &gt;
              </Link>
            </div>
            <nav className="rounded-lg border border-gray-200 bg-white p-3">
              <p className="mb-2 px-2 text-xs font-semibold text-gray-500">마이페이지</p>
              <Link href="/my" className="block rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900">
                홈
              </Link>
              <Link href="/my/profile" className="block rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900">
                회원 정보 수정
              </Link>
              <Link href="/my/pets" className="block rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900">
                반려동물 프로필
              </Link>
              <Link href="/my/orders" className="block rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900">
                주문 내역
              </Link>
              <Link
                href="/my/cancel-returns"
                className={`block rounded-md px-3 py-2 text-sm font-medium ${pathname?.startsWith('/my/cancel-returns') ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'}`}
              >
                취소/교환/반품 내역
              </Link>
              <Link href="/my/reviews" className="block rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900">
                리뷰 관리
              </Link>
              <Link
                href="/my/inquiries"
                className={`block rounded-md px-3 py-2 text-sm font-medium ${pathname?.startsWith('/my/inquiries') ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'}`}
              >
                나의 문의 내역
              </Link>
              <Link href="/my/wishlist" className="block rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900">
                찜 목록
              </Link>
              <Link
                href="/recent"
                className={`block rounded-md px-3 py-2 text-sm font-medium ${pathname === '/recent' ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'}`}
              >
                최근 본 상품
              </Link>
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    localStorage.removeItem(USER_TOKEN_KEY);
                    router.replace('/');
                    router.refresh();
                  }
                }}
                className="mt-2 block w-full rounded-md px-3 py-2 text-left text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700"
              >
                로그아웃
              </button>
            </nav>
          </aside>
          <div className="min-w-0 flex-1">{children}</div>
        </div>
      </main>
      <SiteFooter />
      <FloatingRightWidget />
    </div>
  );
}
