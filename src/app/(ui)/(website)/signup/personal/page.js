'use client';

import SignupForm from '@/components/auth/SignupForm';
import Link from 'next/link';

export default function PersonalSignupPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">개인회원 가입</h1>
        <p className="mt-1 text-sm text-gray-500">쇼핑·주문·마이페이지 이용을 위한 회원가입입니다.</p>
      </div>
      <SignupForm />
      <p className="mt-4 text-center text-sm text-gray-500">
        <Link href="/signup" className="text-gray-600 underline hover:text-gray-900">← 회원 유형 선택</Link>
      </p>
    </div>
  );
}
