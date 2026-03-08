'use client';

import Link from 'next/link';

const PLACEHOLDER_ICON = (
  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200 text-gray-500">
    —
  </span>
);

export default function CategoryShortcut({ categories }) {
  // TODO: categories 미전달 시 더미 카테고리 사용. 카테고리 API 연동 후 제거
  const list = categories?.length ? categories : [
    { id: '1', name: '의류', slug: 'clothing' },
    { id: '2', name: '산책용품', slug: 'walk' },
    { id: '3', name: '이동용품', slug: 'travel' },
    { id: '4', name: '쿠션/방석', slug: 'cushion' },
    { id: '5', name: '간식/식품', slug: 'food' },
    { id: '6', name: '놀이/장난감', slug: 'toy' },
  ];

  return (
    <section className="border-y border-gray-100 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-14 md:px-6">
        <h2 className="sr-only">카테고리 바로가기</h2>
        <ul className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-6">
          {list.map((cat) => (
            <li key={cat.id}>
              <Link
                href={`/products?category=${cat.slug || cat.id}`}
                className="flex flex-col items-center gap-4 rounded-lg py-5 transition-colors hover:bg-gray-50"
              >
                {cat.icon ?? PLACEHOLDER_ICON}
                <span className="text-center text-sm text-gray-600">
                  {cat.name}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
