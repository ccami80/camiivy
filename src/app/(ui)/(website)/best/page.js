'use client';

import { useEffect, useState } from 'react';
import CategoryPageTitle from '@/components/website/CategoryPageTitle';
import ProductGrid from '@/components/website/ProductGrid';
import api from '@/utils/apis';
import { getBackendUri, store } from '@/utils/apiPaths';

export default function BestPage() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get({ uri: getBackendUri(), path: `${store.products}?sort=popular` })
      .then((data) => setList(Array.isArray(data) ? data : []))
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 pb-12">
      <CategoryPageTitle
        breadcrumbLabel="베스트"
        title="BEST"
        subtitle="까미의 베스트 상품을 만나보세요"
      />
      <div className="mt-6">
        {loading ? (
          <p className="py-12 text-center text-gray-500">로딩 중…</p>
        ) : (
          <ProductGrid products={list} />
        )}
      </div>
    </div>
  );
}
