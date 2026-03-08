'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useDispatch } from 'react-redux';
import { setUser } from '@/redux/reducers/authReducer';
import { setTokensForRole } from '@/lib/authHelpers';
import api from '@/utils/apis';
import { getBackendUri, auth } from '@/utils/apiPaths';
import { USER_TOKEN_KEY } from '@/lib/authHelpers';

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') || null;
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    if (!password?.trim()) {
      setError('비밀번호를 입력해 주세요.');
      setLoading(false);
      return;
    }
    const trimmedEmail = email.trim();
    const roleFromEmail = trimmedEmail.toLowerCase().startsWith('admin@')
      ? 'admin'
      : trimmedEmail.toLowerCase().startsWith('seller@')
        ? 'partner'
        : 'user';

    try {
      if (roleFromEmail === 'user') {
        const data = await api.post({
          uri: getBackendUri(),
          path: auth.login,
          data: { email: trimmedEmail, password },
        });
        if (data?.token && typeof window !== 'undefined') {
          window.localStorage.setItem(USER_TOKEN_KEY, data.token);
        }
        const role = 'user';
        dispatch(setUser({ email: trimmedEmail, role }));
        setTokensForRole(role);
        const redirectPath = next || '/my';
        router.push(redirectPath);
        router.refresh();
      } else {
        const role = roleFromEmail;
        dispatch(setUser({ email: trimmedEmail, role }));
        setTokensForRole(role);
        const redirectPath =
          next ||
          (roleFromEmail === 'admin' ? '/admin' : '/partner');
        router.push(redirectPath);
        router.refresh();
      }
    } catch (err) {
      setError(err?.message || '로그인 처리 중 오류가 발생했습니다.');
    }
    setLoading(false);
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold text-gray-900">로그인</h1>
      <p className="mt-1 text-sm text-gray-500">CAMI & IVY</p>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {error && (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
            {error}
          </p>
        )}
        <div>
          <label htmlFor="login-email" className="block text-sm font-medium text-gray-700">
            이메일
          </label>
          <input
            id="login-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
          />
        </div>
        <div>
          <label htmlFor="login-password" className="block text-sm font-medium text-gray-700">
            비밀번호
          </label>
          <input
            id="login-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {loading ? '로그인 중…' : '로그인'}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-gray-500">
        <Link href="/signup" className="font-medium text-gray-700 underline hover:text-gray-900">
          회원가입
        </Link>
      </p>
      <p className="mt-1 text-center text-sm text-gray-500">
        <Link href="/signup/partner" className="font-medium text-gray-700 underline hover:text-gray-900">
          입점업체 회원가입
        </Link>
      </p>
      <p className="mt-2 text-center text-sm text-gray-500">
        <Link href="/" className="underline hover:text-gray-700">
          메인으로
        </Link>
      </p>
      <div className="mt-6 border-t border-gray-100 pt-6">
        <p className="text-center text-xs font-medium uppercase tracking-wider text-gray-400">
          Guest
        </p>
        <p className="mt-2 text-center text-sm text-gray-500">
          <Link href="/order-inquiry" className="font-medium text-gray-700 underline hover:text-gray-900">
            비회원 주문 조회
          </Link>
        </p>
      </div>
    </div>
  );
}
