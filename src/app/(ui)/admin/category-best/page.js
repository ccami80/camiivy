'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

function getToken() {
  return typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
}

export default function AdminCategoryBestPage() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addProductId, setAddProductId] = useState('');
  const [adding, setAdding] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);
  const [error, setError] = useState('');

  function loadCategories() {
    const token = getToken();
    if (!token) return;
    fetch('/api/admin/categories', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }

  function loadProducts() {
    const token = getToken();
    if (!token) return;
    fetch('/api/admin/products', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setProducts(Array.isArray(data) ? data.filter((p) => p.approvalStatus === 'APPROVED') : []));
  }

  function loadList() {
    if (!selectedCategoryId) {
      setList([]);
      return;
    }
    const token = getToken();
    if (!token) return;
    fetch(`/api/admin/category-best?categoryId=${encodeURIComponent(selectedCategoryId)}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setList(Array.isArray(data) ? data : []));
  }

  useEffect(() => {
    loadCategories();
    loadProducts();
  }, []);

  useEffect(() => {
    loadList();
  }, [selectedCategoryId]);

  function handleAdd() {
    if (!addProductId || !selectedCategoryId) return;
    setAdding(true);
    setError('');
    fetch('/api/admin/category-best', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify({ categoryId: selectedCategoryId, productId: addProductId }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setAddProductId('');
        loadList();
      })
      .catch((err) => setError(err.message))
      .finally(() => setAdding(false));
  }

  function handleRemove(id) {
    if (!confirm('카테고리 베스트에서 제거하시겠습니까?')) return;
    fetch(`/api/admin/category-best/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${getToken()}` } })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        loadList();
      });
  }

  function moveUp(index) {
    if (index <= 0) return;
    const next = [...list];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    saveOrder(next.map((i) => i.id));
  }

  function moveDown(index) {
    if (index >= list.length - 1) return;
    const next = [...list];
    [next[index], next[index + 1]] = [next[index + 1], next[index]];
    saveOrder(next.map((i) => i.id));
  }

  function saveOrder(ids) {
    if (!selectedCategoryId) return;
    setSavingOrder(true);
    fetch('/api/admin/category-best', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify({ categoryId: selectedCategoryId, order: ids }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setList(Array.isArray(data) ? data : list);
        loadList();
      })
      .finally(() => setSavingOrder(false));
  }

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId);
  const bestIds = new Set(list.map((i) => i.productId));
  const availableProducts = products.filter(
    (p) => p.categoryId === selectedCategoryId && !bestIds.has(p.id)
  );

  if (loading) return <p className="text-gray-500">로딩 중…</p>;

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">카테고리별 베스트 상품</h1>
      <p className="mt-1 text-sm text-gray-500">
        상품 상세 페이지의 「카테고리별 베스트 상품」 섹션에 노출할 상품을 카테고리별로 설정합니다. 카테고리를 선택한 뒤 베스트 상품을 추가·순서 변경·제거할 수 있습니다. 설정이 없으면 해당 카테고리의 승인 상품을 노출 순서대로 노출합니다.
      </p>

      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700">카테고리 선택</label>
        <select
          value={selectedCategoryId}
          onChange={(e) => setSelectedCategoryId(e.target.value)}
          className="mt-1 max-w-md rounded-md border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="">카테고리 선택</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.petType} · {c.name}
            </option>
          ))}
        </select>
      </div>

      {!selectedCategoryId ? (
        <p className="mt-6 text-gray-500">카테고리를 선택하면 해당 카테고리의 베스트 상품 목록을 편집할 수 있습니다.</p>
      ) : (
        <>
          <div className="mt-6 flex flex-wrap items-end gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">베스트 상품 추가</label>
              <select
                value={addProductId}
                onChange={(e) => setAddProductId(e.target.value)}
                className="mt-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="">선택</option>
                {availableProducts.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <button
              type="button"
              disabled={adding || !addProductId}
              onClick={handleAdd}
              className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
            >
              {adding ? '추가 중…' : '추가'}
            </button>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>

          {list.length === 0 ? (
            <p className="mt-6 text-gray-500">
              이 카테고리에 등록된 베스트 상품이 없습니다. 추가하면 해당 카테고리 상품의 상세 페이지에서 설정한 목록이 노출되고, 없으면 카테고리 내 상품을 노출 순서대로 노출합니다.
            </p>
          ) : (
            <ul className="mt-6 space-y-2">
              {list.map((item, index) => (
                <li key={item.id} className="flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-3">
                  <span className="w-8 text-sm font-medium text-gray-500">{index + 1}</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={savingOrder || index === 0}
                      onClick={() => moveUp(index)}
                      className="rounded border border-gray-300 px-2 py-1 text-xs disabled:opacity-50"
                    >▲</button>
                    <button
                      type="button"
                      disabled={savingOrder || index === list.length - 1}
                      onClick={() => moveDown(index)}
                      className="rounded border border-gray-300 px-2 py-1 text-xs disabled:opacity-50"
                    >▼</button>
                  </div>
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded border bg-gray-100">
                    {item.product?.images?.[0]?.url ? (
                      <img src={item.product.images[0].url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-gray-400">-</div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link href={`/admin/products/${item.productId}`} className="font-medium text-gray-900 hover:underline">
                      {item.product?.name}
                    </Link>
                    <p className="text-sm text-gray-500">{item.product?.basePrice?.toLocaleString()}원</p>
                  </div>
                  <button type="button" onClick={() => handleRemove(item.id)} className="text-sm text-red-600 hover:underline">
                    제거
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
