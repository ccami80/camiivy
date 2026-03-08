'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

function getToken() {
  return typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
}

export default function AdminRecommendedPage() {
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addProductId, setAddProductId] = useState('');
  const [adding, setAdding] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);
  const [error, setError] = useState('');

  function loadProducts() {
    const token = getToken();
    if (!token) return;
    fetch('/api/admin/products', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setProducts(Array.isArray(data) ? data.filter((p) => p.approvalStatus === 'APPROVED') : []))
      .finally(() => setLoading(false));
  }

  function loadList() {
    if (!selectedProductId) {
      setList([]);
      return;
    }
    const token = getToken();
    if (!token) return;
    fetch(`/api/admin/recommended?productId=${encodeURIComponent(selectedProductId)}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setList(Array.isArray(data) ? data : []));
  }

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    loadList();
  }, [selectedProductId]);

  function handleAdd() {
    if (!addProductId || !selectedProductId) return;
    setAdding(true);
    setError('');
    fetch('/api/admin/recommended', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify({ productId: selectedProductId, recommendedProductId: addProductId }),
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
    if (!confirm('함께 구매 추천에서 제거하시겠습니까?')) return;
    fetch(`/api/admin/recommended/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${getToken()}` } })
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
    if (!selectedProductId) return;
    setSavingOrder(true);
    fetch('/api/admin/recommended', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify({ productId: selectedProductId, order: ids }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setList(Array.isArray(data) ? data : list);
        loadList();
      })
      .finally(() => setSavingOrder(false));
  }

  const selectedProduct = products.find((p) => p.id === selectedProductId);
  const recommendedIds = new Set(list.map((i) => i.recommendedProductId));
  const availableProducts = products.filter(
    (p) => p.id !== selectedProductId && !recommendedIds.has(p.id)
  );

  if (loading) return <p className="text-gray-500">로딩 중…</p>;

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">함께 구매하면 좋은 상품</h1>
      <p className="mt-1 text-sm text-gray-500">
        상품 상세 페이지의 「함께 구매하면 좋은 상품이에요」 섹션에 노출할 상품을 상품별로 설정합니다. 상품을 선택한 뒤 추천 상품을 추가·순서 변경·제거할 수 있습니다. 설정이 없으면 자동 추천(같은 카테고리 등)으로 노출됩니다.
      </p>

      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700">대상 상품 선택</label>
        <select
          value={selectedProductId}
          onChange={(e) => setSelectedProductId(e.target.value)}
          className="mt-1 max-w-md rounded-md border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="">상품 선택</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        {selectedProduct && (
          <p className="mt-1 text-sm text-gray-500">
            <Link href={`/products/${selectedProduct.id}`} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
              상세 페이지 보기 →
            </Link>
          </p>
        )}
      </div>

      {!selectedProductId ? (
        <p className="mt-6 text-gray-500">상품을 선택하면 해당 상품의 함께 구매 추천 목록을 편집할 수 있습니다.</p>
      ) : (
        <>
          <div className="mt-6 flex flex-wrap items-end gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">추천 상품 추가</label>
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
            <p className="mt-6 text-gray-500">등록된 추천 상품이 없습니다. 추가하면 이 상품 상세에서만 설정한 목록이 노출되고, 없으면 자동 추천이 노출됩니다.</p>
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
                    {item.recommendedProduct?.images?.[0]?.url ? (
                      <img src={item.recommendedProduct.images[0].url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-gray-400">-</div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link href={`/admin/products/${item.recommendedProductId}`} className="font-medium text-gray-900 hover:underline">
                      {item.recommendedProduct?.name}
                    </Link>
                    <p className="text-sm text-gray-500">{item.recommendedProduct?.basePrice?.toLocaleString()}원</p>
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
