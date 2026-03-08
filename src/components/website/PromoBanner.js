'use client';

import Link from 'next/link';

export default function PromoBanner() {
  return (
    <section className="border-b border-gray-100 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-4 md:px-6">
        <Link
          href="/products"
          className="flex flex-wrap items-center justify-center gap-2 text-center text-sm text-gray-600 hover:text-gray-900"
        >
          <span className="rounded bg-[var(--cami)]/20 px-2 py-0.5 text-xs font-medium text-[var(--cami-deep)]">
            이벤트
          </span>
          <span>신규 가입 시 첫 구매 10% 할인 · 무료배송 이벤트 진행 중</span>
          <span className="text-gray-400">→</span>
        </Link>
      </div>
    </section>
  );
}
