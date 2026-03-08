'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useDispatch } from 'react-redux';
import { setUser } from '@/redux/reducers/authReducer';
import { setTokensForRole } from '@/lib/authHelpers';
import api from '@/utils/apis';
import { getBackendUri, auth } from '@/utils/apiPaths';
import { USER_TOKEN_KEY } from '@/lib/authHelpers';

export default function SignupForm() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (password !== passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }
    if (password.length < 6) {
      setError('비밀번호는 6자 이상이어야 합니다.');
      return;
    }
    if (!name?.trim()) {
      setError('이름을 입력해 주세요.');
      return;
    }
    setLoading(true);
    try {
      const data = await api.post({
        uri: getBackendUri(),
        path: auth.signup,
        data: {
          email: email.trim(),
          password,
          name: name.trim(),
          phone: null,
        },
      });
      if (data?.token && typeof window !== 'undefined') {
        window.localStorage.setItem(USER_TOKEN_KEY, data.token);
      }
      const userEmail = data?.user?.email ?? email.trim();
      dispatch(setUser({ email: userEmail, role: 'user' }));
      setTokensForRole('user');
      router.push('/my');
      router.refresh();
    } catch (err) {
      setError(err?.message || '회원가입 처리 중 오류가 발생했습니다.');
    }
    setLoading(false);
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold text-gray-900">회원가입</h1>
      <p className="mt-1 text-sm text-gray-500">일반 회원 가입</p>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {error && (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
            {error}
          </p>
        )}
        <div>
          <label htmlFor="signup-email" className="block text-sm font-medium text-gray-700">
            이메일
          </label>
          <input
            id="signup-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
          />
        </div>
        <div>
          <label htmlFor="signup-name" className="block text-sm font-medium text-gray-700">
            이름
          </label>
          <input
            id="signup-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoComplete="name"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
          />
        </div>
        <div>
          <label htmlFor="signup-password" className="block text-sm font-medium text-gray-700">
            비밀번호
          </label>
          <input
            id="signup-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            autoComplete="new-password"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
          />
        </div>
        <div>
          <label htmlFor="signup-password-confirm" className="block text-sm font-medium text-gray-700">
            비밀번호 확인
          </label>
          <input
            id="signup-password-confirm"
            type="password"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            required
            minLength={6}
            autoComplete="new-password"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {loading ? '가입 중…' : '가입'}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-gray-500">
        이미 계정이 있으신가요?{' '}
        <Link href="/login" className="font-medium text-gray-700 underline hover:text-gray-900">
          로그인
        </Link>
      </p>
      <p className="mt-2 text-center text-sm text-gray-500">
        <Link href="/" className="underline hover:text-gray-700">
          메인으로
        </Link>
      </p>
    </div>
  );
}
