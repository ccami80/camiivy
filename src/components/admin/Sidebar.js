'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useState } from 'react';

const MENU = [
  { href: '/admin/dashboard', label: '대시보드' },
  {
    label: '입점업체 관리',
    children: [
      { href: '/admin/partners', label: '승인 대기' },
      { href: '/admin/partners?status=approved', label: '승인된 입점업체' },
    ],
  },
  {
    label: '상품 관리',
    children: [
      { href: '/admin/products/approval', label: '상품 승인' },
      { href: '/admin/products', label: '상품 목록' },
    ],
  },
  { href: '/admin/products/display', label: '노출 관리' },
  {
    label: '메인페이지 관리',
    children: [
      { href: '/admin/home-sections', label: '메인 섹션 (신상품/베스트)' },
      { href: '/admin/banners', label: '배너 관리' },
    ],
  },
  { href: '/admin/curation', label: '고객님을 위한 상품' },
  {
    label: '상품 상세 하단 관리',
    children: [
      { href: '/admin/product-detail-sections', label: '개요' },
      { href: '/admin/category-best', label: '카테고리별 베스트' },
      { href: '/admin/recommended', label: '함께 구매 추천' },
    ],
  },
  { href: '/admin/orders', label: '주문 관리' },
  {
    label: '고객센터 관리',
    children: [
      { href: '/admin/customer-center?tab=notice', label: '공지사항' },
      { href: '/admin/customer-center?tab=faq', label: 'FAQ' },
      { href: '/admin/one-to-one-inquiries', label: '고객센터 문의' },
    ],
  },
  { href: '/admin/dashboard', label: '통계' },
  { href: '/admin/example', label: '예시 (UI)' },
];

function NavLink({ href, label, isActive }) {
  return (
    <Link
      href={href}
      className={`block rounded-md px-3 py-2 text-sm ${
        isActive
          ? 'bg-gray-100 font-medium text-gray-900'
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
      }`}
    >
      {label}
    </Link>
  );
}

function SubMenu({ items, pathname, searchParams }) {
  const searchString = searchParams?.toString() ?? '';
  let usedHrefForActive = null; // 같은 href 중 첫 번째만 활성
  return (
    <ul className="mt-1 space-y-0.5 border-l border-gray-200 pl-3 ml-3">
      {items.map((item) => {
        const base = item.href?.split('?')[0];
        const pathOnly = pathname?.split('?')[0];
        const itemQuery = item.href?.includes('?') ? item.href.split('?')[1] : '';
        let rawActive;
        if (base === '/admin/products') {
          rawActive = pathOnly === '/admin/products';
        } else if (itemQuery) {
          // 쿼리가 있는 항목(예: 승인된 입점업체): path + 쿼리 모두 일치할 때만 활성
          rawActive = pathOnly === base && searchString === itemQuery;
        } else {
          // 쿼리 없음(예: 승인 대기): path 일치하고, 동일 path에 쿼리 있는 다른 항목이 활성일 수 있으므로 현재 쿼리도 없을 때만
          if (base === '/admin/partners') {
            rawActive = pathOnly === base && !searchString;
          } else {
            rawActive = pathOnly === base || (base && pathname.startsWith(base + '/'));
          }
        }
        const isActive = rawActive && (usedHrefForActive === null || usedHrefForActive !== item.href);
        if (rawActive) usedHrefForActive = item.href;
        return (
          <li key={item.href + item.label}>
            <NavLink href={item.href} label={item.label} isActive={!!isActive} />
          </li>
        );
      })}
    </ul>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [openGroups, setOpenGroups] = useState({ '입점업체 관리': true, '상품 관리': true, '메인페이지 관리': true, '상품 상세 하단 관리': true, '고객센터 관리': true });

  const toggleGroup = (label) => {
    setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <aside className="fixed left-0 top-0 z-10 h-full w-56 border-r border-gray-100 bg-white">
      <div className="flex h-14 items-center justify-between border-b border-gray-100 px-4">
        <Link href="/admin/dashboard" className="text-sm font-medium text-gray-900">
          CAMI & IVY Admin
        </Link>
        <Link
          href="/"
          className="rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
        >
          메인으로
        </Link>
      </div>
      <nav className="space-y-0.5 p-4">
        {MENU.map((item) => {
          if (item.href) {
            const isActive =
              item.href === '/admin/dashboard'
                ? pathname === '/admin/dashboard'
                : pathname.startsWith(item.href.split('?')[0]);
            return (
              <div key={item.href + item.label}>
                <NavLink href={item.href} label={item.label} isActive={isActive} />
              </div>
            );
          }
          const isOpen = openGroups[item.label] !== false;
          const hasActiveChild = item.children?.some(
            (c) => pathname === c.href?.split('?')[0] || (c.href && pathname.startsWith(c.href.split('?')[0]))
          );
          return (
            <div key={item.label}>
              <button
                type="button"
                onClick={() => toggleGroup(item.label)}
                className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm ${
                  hasActiveChild ? 'font-medium text-gray-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {item.label}
                <span className={`text-gray-400 transition ${isOpen ? 'rotate-90' : ''}`}>›</span>
              </button>
              {isOpen && item.children && <SubMenu items={item.children} pathname={pathname} searchParams={searchParams} />}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
