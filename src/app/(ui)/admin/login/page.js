'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const MOCK_ADMIN_TOKEN_KEY = 'adminToken';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    setError('');
    // Mock: no validation, no API. Set token and redirect.
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(MOCK_ADMIN_TOKEN_KEY, 'mock');
    }
    router.replace('/admin/dashboard');
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="rounded-lg border border-gray-100 bg-white p-8 shadow-sm">
          <h1 className="text-center text-lg font-medium text-gray-900">
            CAMI & IVY Admin
          </h1>
          <p className="mt-2 text-center text-xs text-gray-500">
            관리자 전용 페이지입니다.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label htmlFor="admin-email" className="block text-sm text-gray-600">
                이메일
              </label>
              <input
                id="admin-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                className="mt-1.5 block w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
                placeholder="admin@example.com"
              />
            </div>
            <div>
              <label htmlFor="admin-password" className="block text-sm text-gray-600">
                비밀번호
              </label>
              <input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="mt-1.5 block w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="w-full rounded-md border border-gray-800 bg-gray-800 py-2.5 text-sm font-medium text-white hover:bg-gray-700"
            >
              로그인
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
