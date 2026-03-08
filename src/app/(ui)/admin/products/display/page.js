'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import FilterBar from '@/components/admin/FilterBar';
import ProductDisplayTable from '@/components/admin/ProductDisplayTable';
import { useProductStore } from '@/store/productStore';
import { getAdminProducts, updateProductDisplay, updateProductDisplayOrder } from '@/lib/api/productApi';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';

function mapToDisplayProduct(p) {
  return {
    id: p.id,
    name: p.name,
    price: p.basePrice ?? 0,
    brandName: p.partner?.companyName ?? '-',
    thumbnailUrl: p.images?.[0]?.url ?? '',
    category: p.category?.name ?? '-',
    isDisplayed: p.displayOrder != null,
    displayOrder: p.displayOrder ?? 0,
    approvedAt: p.createdAt ? String(p.createdAt).slice(0, 10) : '-',
  };
}

export default function AdminProductsDisplayPage() {
  const { list, loading, error, setList, setLoading, setError, updateDisplayById, setDisplayOrderByProductIds } =
    useProductStore();
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [initialSnapshot, setInitialSnapshot] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchList = useCallback(() => {
    setLoading(true);
    getAdminProducts('APPROVED')
      .then((data) => setList(Array.isArray(data) ? data : []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [setList, setLoading, setError]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const productsDisplay = useMemo(() => list.map(mapToDisplayProduct), [list]);

  useEffect(() => {
    if (initialSnapshot === null && productsDisplay.length > 0) {
      setInitialSnapshot(
        productsDisplay.reduce((acc, p) => {
          acc[p.id] = { isDisplayed: p.isDisplayed, displayOrder: p.displayOrder ?? 0 };
          return acc;
        }, {})
      );
    }
  }, [productsDisplay, initialSnapshot]);

  const categories = useMemo(() => {
    const set = new Set(productsDisplay.map((p) => p.category).filter(Boolean));
    return Array.from(set).sort();
  }, [productsDisplay]);

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return productsDisplay.filter((p) => {
      if (statusFilter === 'displayed' && !p.isDisplayed) return false;
      if (statusFilter === 'hidden' && p.isDisplayed) return false;
      if (categoryFilter && p.category !== categoryFilter) return false;
      if (q && !p.name.toLowerCase().includes(q) && !String(p.brandName).toLowerCase().includes(q))
        return false;
      return true;
    });
  }, [productsDisplay, statusFilter, categoryFilter, searchQuery]);

  const sortedProducts = useMemo(() => {
    return [...filteredProducts].sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
  }, [filteredProducts]);

  const hasChanges = useMemo(() => {
    if (!initialSnapshot) return false;
    return productsDisplay.some(
      (p) =>
        initialSnapshot[p.id] &&
        (initialSnapshot[p.id].isDisplayed !== p.isDisplayed ||
          initialSnapshot[p.id].displayOrder !== (p.displayOrder ?? 0))
    );
  }, [productsDisplay, initialSnapshot]);

  const toggleSelect = useCallback((id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectAllFiltered = useCallback(() => {
    if (selectedIds.size === sortedProducts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(sortedProducts.map((p) => p.id)));
    }
  }, [sortedProducts, selectedIds.size]);

  const setDisplay = useCallback(
    async (id, isDisplayed) => {
      const prev = list.find((p) => p.id === id);
      const nextOrder = isDisplayed ? (prev?.displayOrder ?? 0) : null;
      updateDisplayById(id, { displayOrder: nextOrder });
      try {
        await updateProductDisplay(id, nextOrder);
      } catch (err) {
        if (prev) updateDisplayById(id, { displayOrder: prev.displayOrder });
        setError(err.message || '노출 설정 중 오류가 발생했습니다.');
      }
    },
    [list, updateDisplayById, setError]
  );

  const setOrder = useCallback(
    (id, displayOrder) => {
      const prev = list.find((p) => p.id === id);
      if (!prev) return;
      updateDisplayById(id, { displayOrder });
    },
    [list, updateDisplayById]
  );

  const handleSave = useCallback(async () => {
    const displayed = productsDisplay
      .filter((p) => p.isDisplayed)
      .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
    const productIds = displayed.map((p) => p.id);
    if (productIds.length === 0) return;
    setSaving(true);
    setError(null);
    try {
      await updateProductDisplayOrder(productIds);
      setDisplayOrderByProductIds(productIds);
      setInitialSnapshot(
        productsDisplay.reduce((acc, p) => {
          acc[p.id] = { isDisplayed: p.isDisplayed, displayOrder: p.displayOrder ?? 0 };
          return acc;
        }, {})
      );
    } catch (err) {
      setError(err.message || '순서 저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  }, [productsDisplay, setDisplayOrderByProductIds, setError]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">상품 노출 관리</h1>
        <p className="mt-2 text-sm text-gray-500">
          승인 완료된 상품의 노출 여부, 정렬 순서, 진열 상태를 관리합니다.
        </p>
      </div>

      <ErrorMessage message={error} onRetry={fetchList} />

      <FilterBar
        statusFilter={statusFilter}
        categoryFilter={categoryFilter}
        searchQuery={searchQuery}
        categories={categories}
        onStatusChange={setStatusFilter}
        onCategoryChange={setCategoryFilter}
        onSearchChange={setSearchQuery}
      />

      <ProductDisplayTable
        products={sortedProducts}
        selectedIds={selectedIds}
        onToggleSelect={toggleSelect}
        onSelectAll={selectAllFiltered}
        onDisplayChange={setDisplay}
        onOrderChange={setOrder}
        onSave={handleSave}
        hasChanges={hasChanges}
        isSaving={saving}
      />
    </div>
  );
}
