'use client';

import { useEffect, useMemo, useState } from 'react';
import CategoryPageTitle from '@/components/website/CategoryPageTitle';
import ProductGrid from '@/components/website/ProductGrid';
import api from '@/utils/apis';
import { getBackendUri, store } from '@/utils/apiPaths';

export default function BrandPage() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeKey, setActiveKey] = useState('all');

  useEffect(() => {
    api
      .get({ uri: getBackendUri(), path: store.products })
      .then((data) => setList(Array.isArray(data) ? data : []))
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  }, []);

  const brandFilters = useMemo(() => {
    const brands = new Set();
    list.forEach((p) => {
      if (p.brand && String(p.brand).trim()) brands.add(String(p.brand).trim());
    });
    return Array.from(brands).sort((a, b) => a.localeCompare(b, 'ko'));
  }, [list]);

  const filters = useMemo(
    () => [
      { key: 'all', label: '전체' },
      ...brandFilters.map((brand) => ({ key: brand, label: brand })),
    ],
    [brandFilters]
  );

  const filteredList = useMemo(() => {
    if (activeKey === 'all') return list;
    return list.filter((p) => p.brand && String(p.brand).trim() === activeKey);
  }, [list, activeKey]);

  return (
    <div className="mx-auto max-w-6xl px-4 pb-12">
      <CategoryPageTitle
        breadcrumbLabel="브랜드"
        title="BRAND"
        subtitle="등록된 브랜드의 상품을 만나보세요"
      />
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {filters.map((f) => (
          <button
            type="button"
            key={f.key}
            onClick={() => setActiveKey(f.key)}
            className={`rounded-lg border-2 px-5 py-2.5 text-sm font-medium transition-colors ${
              activeKey === f.key
                ? 'border-gray-900 bg-gray-900 text-white hover:bg-gray-800'
                : 'border-gray-200 text-gray-700 hover:border-gray-900 hover:text-gray-900'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>
      <div className="mt-8">
        {loading ? (
          <p className="py-12 text-center text-gray-500">로딩 중…</p>
        ) : (
          <ProductGrid
            products={filteredList}
            emptyMessage={activeKey === 'all' ? '등록된 상품이 없습니다.' : '해당 브랜드 상품이 없습니다.'}
          />
        )}
      </div>
    </div>
  );
}
