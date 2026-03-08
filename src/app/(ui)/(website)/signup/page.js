'use client';

import Link from 'next/link';

export default function SignupTypePage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <div className="text-center mb-10">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">회원가입</h1>
        <p className="mt-2 text-sm text-gray-500">가입 유형을 선택해 주세요.</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {/* 개인회원 */}
        <Link
          href="/signup/personal"
          className="group flex flex-col rounded-xl border-2 border-gray-200 bg-white p-6 text-left shadow-sm transition hover:border-gray-400 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
        >
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 text-gray-600 group-hover:bg-gray-200">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </span>
          <h2 className="mt-4 text-lg font-semibold text-gray-900">개인회원</h2>
          <p className="mt-1 text-sm text-gray-500">쇼핑, 주문, 마이페이지 이용을 위한 일반 회원가입입니다.</p>
          <span className="mt-4 inline-flex items-center text-sm font-medium text-gray-700 group-hover:text-gray-900">
            가입하기
            <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </Link>

        {/* 사업자(입점업체) 회원 */}
        <Link
          href="/signup/partner"
          className="group flex flex-col rounded-xl border-2 border-gray-200 bg-white p-6 text-left shadow-sm transition hover:border-gray-400 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
        >
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-amber-50 text-amber-700 group-hover:bg-amber-100">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </span>
          <h2 className="mt-4 text-lg font-semibold text-gray-900">사업자 회원</h2>
          <p className="mt-1 text-sm text-gray-500">사업자번호 인증 후 입점업체로 가입합니다. 승인 후 상품 등록이 가능합니다.</p>
          <span className="mt-4 inline-flex items-center text-sm font-medium text-gray-700 group-hover:text-gray-900">
            입점업체 가입
            <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </Link>
      </div>

      <p className="mt-8 text-center text-sm text-gray-500">
        이미 계정이 있으신가요?{' '}
        <Link href="/login" className="font-medium text-gray-700 underline hover:text-gray-900">로그인</Link>
      </p>
    </div>
  );
}
