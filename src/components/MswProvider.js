'use client';

import { useEffect, useState } from 'react';

/**
 * In development, when NEXT_PUBLIC_USE_MSW=true, starts MSW to mock API requests.
 * Leave the env var unset or false to use real API/DB.
 */
export function MswProvider({ children }) {
  const [ready, setReady] = useState(true);

  useEffect(() => {
    const useMock = process.env.NEXT_PUBLIC_USE_MSW === 'true';
    if (!useMock || typeof window === 'undefined') {
      setReady(true);
      return;
    }
    let cancelled = false;
    async function start() {
      try {
        const { startMockWorker } = await import('@/mocks/browser.js');
        await startMockWorker();
        if (!cancelled) setReady(true);
      } catch (e) {
        if (!cancelled) {
          console.warn('[MSW] Failed to start mock worker:', e);
          setReady(true);
        }
      }
    }
    start();
    return () => {
      cancelled = true;
    };
  }, []);

  return children;
}
