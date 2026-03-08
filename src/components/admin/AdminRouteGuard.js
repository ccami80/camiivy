'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

const MOCK_ADMIN_TOKEN_KEY = 'adminToken';

/**
 * Mock route guard for admin area (frontend-only).
 * If not on login page and no mock token, redirects to /admin/login.
 * Replace with real auth (e.g. AuthGuard + API) when backend is ready.
 */
export default function AdminRouteGuard({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const isLoginPage = pathname === '/admin/login';
    const token = typeof window !== 'undefined' ? window.localStorage.getItem(MOCK_ADMIN_TOKEN_KEY) : null;
    const isAdmin = !!token;

    if (isLoginPage) {
      setAllowed(true);
      return;
    }
    if (isAdmin) {
      setAllowed(true);
      return;
    }
    router.replace('/admin/login');
    setAllowed(false);
  }, [pathname, router]);

  if (!allowed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-sm text-gray-500">Redirecting…</p>
      </div>
    );
  }

  return <>{children}</>;
}
