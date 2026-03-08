'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/utils/apis';
import { getBackendUri, partner } from '@/utils/apiPaths';

export default function SellerSignupForm() {
  const router = useRouter();
  const [companyName, setCompanyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [businessNumber, setBusinessNumber] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post({
        uri: getBackendUri(),
        path: partner.register,
        data: {
          email: email.trim(),
          password,
          companyName: companyName.trim(),
          businessNumber: businessNumber.trim(),
          contactName: contactName.trim(),
          contactPhone: contactPhone.trim(),
        },
      });
      router.push('/partner/pending');
      router.refresh();
    } catch (err) {
      setError(err?.message || '회원가입 처리 중 오류가 발생했습니다.');
      setLoading(false);
    }
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold text-gray-900">입점업체 회원가입</h1>
      <p className="mt-1 text-sm text-gray-500">승인 후 상품 등록이 가능합니다.</p>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {error && (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
            {error}
          </p>
        )}
        <div>
          <label htmlFor="seller-company" className="block text-sm font-medium text-gray-700">
            업체명
          </label>
          <input
            id="seller-company"
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
          />
        </div>
        <div>
          <label htmlFor="seller-contact" className="block text-sm font-medium text-gray-700">
            담당자명
          </label>
          <input
            id="seller-contact"
            type="text"
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
          />
        </div>
        <div>
          <label htmlFor="seller-email" className="block text-sm font-medium text-gray-700">
            이메일
          </label>
          <input
            id="seller-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
          />
        </div>
        <div>
          <label htmlFor="seller-password" className="block text-sm font-medium text-gray-700">
            비밀번호
          </label>
          <input
            id="seller-password"
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
          <label htmlFor="seller-business" className="block text-sm font-medium text-gray-700">
            사업자 등록번호
          </label>
          <input
            id="seller-business"
            type="text"
            value={businessNumber}
            onChange={(e) => setBusinessNumber(e.target.value)}
            required
            placeholder="000-00-00000"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
          />
        </div>
        <div>
          <label htmlFor="seller-phone" className="block text-sm font-medium text-gray-700">
            담당자 연락처
          </label>
          <input
            id="seller-phone"
            type="tel"
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
            required
            placeholder="010-0000-0000"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
        >
          가입 완료
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-gray-500">
        이미 계정이 있으신가요?{' '}
        <Link href="/login" className="font-medium text-gray-700 underline hover:text-gray-900">
          로그인
        </Link>
      </p>
      <p className="mt-2 text-center text-sm text-gray-500">
        <Link href="/signup" className="underline hover:text-gray-700">
          ← 회원 유형 선택
        </Link>
      </p>
    </div>
  );
}
