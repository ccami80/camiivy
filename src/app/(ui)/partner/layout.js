'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

const PARTNER_TOKEN_KEY = 'partnerToken';

const NAV = [
  { href: '/partner/dashboard', label: '대시보드' },
  { href: '/partner/products', label: '상품 목록' },
  { href: '/partner/products/new', label: '상품 등록' },
  { href: '/partner/orders', label: '주문 관리' },
  { href: '/partner/inquiries', label: '판매자 문의' },
  { href: '/partner/settlement', label: '정산 · 업체 정보' },
];

export default function PartnerLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === '/partner/login';
  const isPendingPage = pathname === '/partner/pending';

  useEffect(() => {
    if (isLoginPage || isPendingPage) return;
    const token = typeof window !== 'undefined' ? localStorage.getItem(PARTNER_TOKEN_KEY) : null;
    if (!token) {
      router.replace('/partner/login');
    }
  }, [pathname, isLoginPage, isPendingPage, router]);

  if (isLoginPage || isPendingPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <aside className="fixed left-0 top-0 z-10 h-full w-56 border-r border-gray-100 bg-white">
        <div className="flex h-14 items-center border-b border-gray-100 px-4">
          <Link href="/partner/dashboard" className="font-medium text-gray-800">
            입점업체
          </Link>
        </div>
        <nav className="space-y-0.5 p-3">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                pathname === item.href
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
              }`}
            >
              {item.label}
            </Link>
          ))}
          <div className="border-t border-gray-100 pt-3">
            <Link
              href="/"
              className="block rounded-lg px-3 py-2.5 text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-700"
            >
              메인으로
            </Link>
            <button
              type="button"
              onClick={() => {
                if (typeof window !== 'undefined') {
                  localStorage.removeItem(PARTNER_TOKEN_KEY);
                  router.replace('/partner/login');
                  router.refresh();
                }
              }}
              className="mt-1 block w-full rounded-lg px-3 py-2.5 text-left text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-700"
            >
              로그아웃
            </button>
          </div>
        </nav>
      </aside>
      <main className="pl-56">
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
