'use client';

import { useState, useCallback, useMemo } from 'react';
import ProductExposeFilters from '@/components/admin/ProductExposeFilters';
import ProductExposeTable from '@/components/admin/ProductExposeTable';
import MainCurationPreview from '@/components/admin/MainCurationPreview';

const CATEGORIES = ['산책용품', '의류', '간식/식품', '캣타워/스크래쳐', '쿠션/방석', '놀이/장난감'];

const MOCK_PRODUCTS = [
  { id: 1, name: '프리미엄 강아지 하네스', image: '', brand: 'CAMI', sellerName: '펫츠웨어', category: '산책용품', price: 58000, isExposed: true, isMainExposed: true },
  { id: 2, name: '고양이 스크래쳐 캣타워', image: '', brand: 'IVY', sellerName: '멍냥샵', category: '캣타워/스크래쳐', price: 89000, isExposed: true, isMainExposed: true },
  { id: 3, name: '수제 강아지 간식 3종 세트', image: '', brand: 'CAMI', sellerName: '강아지천국', category: '간식/식품', price: 22000, isExposed: false, isMainExposed: false },
  { id: 4, name: '강아지 방한 조끼', image: '', brand: 'CAMI', sellerName: '펫츠웨어', category: '의류', price: 35000, isExposed: true, isMainExposed: false },
  { id: 5, name: '캣닢 쿠션 방석', image: '', brand: 'IVY', sellerName: '멍냥샵', category: '쿠션/방석', price: 42000, isExposed: true, isMainExposed: true },
  { id: 6, name: '노즈워크 매트', image: '', brand: 'CAMI', sellerName: '강아지천국', category: '놀이/장난감', price: 28000, isExposed: true, isMainExposed: false },
];

export default function AdminProductsExposePage() {
  const [products, setProducts] = useState(MOCK_PRODUCTS);
  const [brandFilter, setBrandFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [exposureFilter, setExposureFilter] = useState('');
  const [selectedIds, setSelectedIds] = useState(new Set());

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (brandFilter && p.brand !== brandFilter) return false;
      if (categoryFilter && p.category !== categoryFilter) return false;
      if (exposureFilter === 'exposed' && !p.isExposed) return false;
      if (exposureFilter === 'hidden' && p.isExposed) return false;
      return true;
    });
  }, [products, brandFilter, categoryFilter, exposureFilter]);

  const toggleSelect = useCallback((id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectAllFiltered = useCallback(() => {
    if (selectedIds.size === filteredProducts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredProducts.map((p) => p.id)));
    }
  }, [filteredProducts, selectedIds.size]);

  const setExposed = useCallback((id, value) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isExposed: value } : p))
    );
    console.log('[노출 변경]', { id, isExposed: value });
  }, []);

  const setMainExposed = useCallback((id, value) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isMainExposed: value } : p))
    );
    console.log('[메인 노출 변경]', { id, isMainExposed: value });
  }, []);

  const batchSetExposed = useCallback((value) => {
    if (selectedIds.size === 0) return;
    setProducts((prev) =>
      prev.map((p) => (selectedIds.has(p.id) ? { ...p, isExposed: value } : p))
    );
    console.log('[일괄 노출 변경]', { ids: [...selectedIds], isExposed: value });
    setSelectedIds(new Set());
  }, [selectedIds]);

  const mainCami = useMemo(() => products.filter((p) => p.brand === 'CAMI' && p.isMainExposed), [products]);
  const mainIvy = useMemo(() => products.filter((p) => p.brand === 'IVY' && p.isMainExposed), [products]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">상품 노출 관리</h1>
        <p className="mt-1 text-sm text-gray-500">
          승인된 상품의 스토어 노출 여부와 메인 큐레이션을 관리합니다.
        </p>
      </div>

      <ProductExposeFilters
        brandFilter={brandFilter}
        categoryFilter={categoryFilter}
        exposureFilter={exposureFilter}
        categories={CATEGORIES}
        onBrandChange={setBrandFilter}
        onCategoryChange={setCategoryFilter}
        onExposureChange={setExposureFilter}
      />

      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
          <span className="text-sm font-medium text-gray-700">상품 목록</span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => batchSetExposed(true)}
              disabled={selectedIds.size === 0}
              className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              선택 상품 일괄 노출
            </button>
            <button
              type="button"
              onClick={() => batchSetExposed(false)}
              disabled={selectedIds.size === 0}
              className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              선택 상품 일괄 비노출
            </button>
          </div>
        </div>
        <ProductExposeTable
          products={filteredProducts}
          selectedIds={selectedIds}
          onToggleSelect={toggleSelect}
          onSelectAll={selectAllFiltered}
          onExposeChange={setExposed}
          onMainExposeChange={setMainExposed}
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <MainCurationPreview brandLabel="까미" products={mainCami} />
        <MainCurationPreview brandLabel="아이비" products={mainIvy} />
      </div>
    </div>
  );
}
