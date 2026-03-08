'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const menuItems = [
  { href: '/my', label: '대시보드' },
  { href: '/my/orders', label: '주문 내역' },
  { href: '/my/wishlist', label: '위시리스트' },
  { href: '/my/reviews', label: '리뷰 관리' },
  { href: '/my/pets', label: '반려동물 프로필' },
  { href: '/my/profile', label: '회원 정보' },
];

export default function SideMenu() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-20 rounded-lg border border-gray-100 bg-white p-4">
      <p className="mb-3 px-2 text-xs font-medium uppercase tracking-wider text-gray-400">
        마이페이지
      </p>
      <ul className="space-y-0.5">
        {menuItems.map((item) => {
          const isActive =
            item.href === '/my'
              ? pathname === '/my'
              : pathname.startsWith(item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`block rounded-md px-3 py-2.5 text-sm ${
                  isActive
                    ? 'bg-gray-100 font-medium text-gray-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
