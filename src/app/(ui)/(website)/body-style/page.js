'use client';

import { useEffect, useState } from 'react';
import CategoryPageTitle from '@/components/website/CategoryPageTitle';
import ProductGrid from '@/components/website/ProductGrid';
import api from '@/utils/apis';
import { getBackendUri, store } from '@/utils/apiPaths';

/** 상단 원형 핏 타입 (이미지 스타일: 검은 원 + 흰 글씨 + 하단 라벨) */
const FIT_TYPES = [
  { id: 'long-body', label: '롱바디핏', circleText: '롱바디' },
  { id: 'bulldog', label: '불독핏', circleText: '불독' },
  { id: 'slim', label: '슬림핏', circleText: '슬림' },
  { id: 'xs', label: '초소형핏', circleText: '초소형' },
  { id: 'large', label: '대형견핏', circleText: '대형견' },
  { id: 'big-head', label: '대두핏', circleText: '대두' },
];


export default function BodyStylePage() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get({ uri: getBackendUri(), path: store.products })
      .then((data) => setList(Array.isArray(data) ? data : []))
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 pb-12">
      <CategoryPageTitle
        breadcrumbLabel="체형별 스타일"
        title="STYLE"
        subtitle="반려동물 체형에 맞는 스타일을 만나보세요"
      />

      {/* 핏 타입 원형 아이콘 (가로 6개) */}
      <section className="mt-8 flex flex-wrap justify-center gap-8 sm:gap-10 md:gap-12">
        {FIT_TYPES.map((fit) => (
          <a
            key={fit.id}
            href={`#${fit.id}`}
            className="flex flex-col items-center gap-3 transition-opacity hover:opacity-80"
          >
            <span
              className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-gray-900 text-center text-xs font-medium text-white sm:h-24 sm:w-24 sm:text-sm"
              aria-hidden
            >
              {fit.circleText}
            </span>
            <span className="text-sm font-medium text-gray-900">{fit.label}</span>
          </a>
        ))}
      </section>

  
      {/* 상품 그리드 */}
      <section className="mt-12">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">체형별 추천 상품</h2>
        {loading ? (
          <p className="py-12 text-center text-gray-500">로딩 중…</p>
        ) : (
          <ProductGrid products={list} emptyMessage="등록된 상품이 없습니다." />
        )}
      </section>
    </div>
  );
}
