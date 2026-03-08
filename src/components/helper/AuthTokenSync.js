'use client';

import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { setTokensForRole } from '@/lib/authHelpers';

/** Rehydrate 후 auth.user가 있으면 토큰 동기화 (한 번만) */
export function AuthTokenSync() {
  const user = useSelector((state) => state.auth?.user);
  const done = useRef(false);

  useEffect(() => {
    if (done.current || !user?.role) return;
    done.current = true;
    setTokensForRole(user.role);
  }, [user?.role]);

  return null;
}
