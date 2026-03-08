'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { clearAuth } from '@/redux/reducers/authReducer';
import { clearTokens } from '@/lib/authHelpers';

const menuItems = [
  { href: '/admin/dashboard', label: '대시보드' },
  { href: '/admin/partners', label: '입점업체 승인' },
  { href: '/admin/orders', label: '주문 관리' },
];

const productMenuItems = [
  { href: '/admin/products/approval', label: '승인 대기 상품' },
  { href: '/admin/products', label: '전체 상품' },
  { href: '/admin/products/display', label: '상품 노출 관리' },
  { href: '/admin/products/expose', label: '노출/메인 관리' },
  { href: '/admin/categories', label: '카테고리 관리' },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();

  return (
    <aside className="fixed left-0 top-0 z-10 h-full w-56 border-r border-gray-100 bg-white">
      <div className="flex h-14 items-center border-b border-gray-100 px-5">
        <Link href="/admin/dashboard" className="text-sm font-medium text-gray-900">
          CAMI & IVY Admin
        </Link>
      </div>
      <nav className="space-y-0.5 p-4">
        {menuItems.map((item) => {
          const isActive =
            item.href === '/admin/dashboard'
              ? pathname === '/admin/dashboard'
              : pathname.startsWith(item.href);
          return (
            <Link
              key={`${item.href}-${item.label}`}
              href={item.href}
              className={`block rounded-md px-3 py-2.5 text-sm ${
                isActive
                  ? 'bg-gray-100 font-medium text-gray-900'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              {item.label}
            </Link>
          );
        })}
        <p className="px-3 py-2 text-xs font-medium uppercase tracking-wider text-gray-400">
          상품 관리
        </p>
        {productMenuItems.map((item) => {
          // '/admin/products'는 목록 페이지만 정확히 일치할 때 활성화. 그 외는 href 또는 하위 경로일 때 활성화.
          const isActive =
            item.href === '/admin/products'
              ? pathname === '/admin/products'
              : pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded-md px-3 py-2.5 text-sm ${
                isActive
                  ? 'bg-gray-100 font-medium text-gray-900'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              {item.label}
            </Link>
          );
        })}
        <Link
          href="/"
          className="block rounded-md px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900"
        >
          메인으로
        </Link>
        <button
          type="button"
          onClick={() => {
            dispatch(clearAuth());
            clearTokens();
            router.replace('/login');
            router.refresh();
          }}
          className="block w-full rounded-md px-3 py-2.5 text-left text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-700"
        >
          로그아웃
        </button>
      </nav>
    </aside>
  );
}
