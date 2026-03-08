'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';

export default function AuthGuard({ children, requiredRole }) {
  const { user, isReady } = useSelector((state) => state.auth);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isReady) return;
    if (!user) {
      router.replace(`/login?next=${encodeURIComponent(pathname || '/')}`);
      return;
    }
    if (requiredRole && user.role !== requiredRole) {
      router.replace(`/login?next=${encodeURIComponent(pathname || '/')}`);
    }
  }, [isReady, user, requiredRole, pathname, router]);

  if (!isReady) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-sm text-gray-500">로딩 중…</p>
      </div>
    );
  }
  if (!user || (requiredRole && user.role !== requiredRole)) {
    return null;
  }
  return <>{children}</>;
}
