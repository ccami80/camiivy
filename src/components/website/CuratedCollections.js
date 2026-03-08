'use client';

import Link from 'next/link';

const COLLECTIONS = [
  {
    key: 'body-type',
    label: '체형별 스타일',
    description: '소형·중형·대형에 맞는 제품',
    href: '/products?curation=body-type',
  },
  {
    key: 'match-owner',
    label: '집사와 함께',
    description: '견주 라이프스타일에 맞춘 픽',
    href: '/products?curation=match-owner',
  },
  {
    key: 'walking',
    label: '산책 필수',
    description: '산책용품 모아보기',
    href: '/products?curation=walking',
  },
];

export default function CuratedCollections() {
  return (
    <section className="border-t border-gray-100 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-16 md:px-6">
        <h2 className="text-center text-xl font-semibold text-gray-900">
          체형별 스타일 · 집사와 함께
        </h2>
        <p className="mt-2 text-center text-sm text-gray-500">
          우리 아이와 집사님에게 맞는 큐레이션
        </p>
        <ul className="mt-10 grid gap-6 sm:grid-cols-3">
          {COLLECTIONS.map((c) => (
            <li key={c.key}>
              <Link
                href={c.href}
                className="block rounded-xl border border-gray-100 bg-gray-50/50 p-8 text-center transition-colors hover:border-[var(--cami)]/30 hover:bg-[var(--cami)]/5"
              >
                <p className="text-base font-semibold text-gray-900">{c.label}</p>
                <p className="mt-1 text-sm text-gray-500">{c.description}</p>
                <span className="mt-4 inline-block text-xs font-medium text-[var(--cami-deep)]">
                  보기 →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
