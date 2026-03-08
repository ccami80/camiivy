'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

function getToken() {
  return typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
}

export default function AdminCurationPage() {
  const [list, setList] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addProductId, setAddProductId] = useState('');
  const [adding, setAdding] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);
  const [error, setError] = useState('');

  function load() {
    const token = getToken();
    if (!token) return;
    Promise.all([
      fetch('/api/admin/curation', { headers: { Authorization: `Bearer ${token}` } }).then((r) => (r.ok ? r.json() : [])),
      fetch('/api/admin/products', { headers: { Authorization: `Bearer ${token}` } }).then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([curation, prods]) => {
        setList(Array.isArray(curation) ? curation : []);
        setProducts(Array.isArray(prods) ? prods.filter((p) => p.approvalStatus === 'APPROVED') : []);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  function handleAdd() {
    if (!addProductId) return;
    setAdding(true);
    setError('');
    fetch('/api/admin/curation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify({ productId: addProductId }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setAddProductId('');
        load();
      })
      .catch((err) => setError(err.message))
      .finally(() => setAdding(false));
  }

  function handleRemove(id) {
    if (!confirm('큐레이션에서 제거하시겠습니까?')) return;
    fetch(`/api/admin/curation/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${getToken()}` } })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        load();
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
    setSavingOrder(true);
    fetch('/api/admin/curation', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify({ order: ids }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setList(Array.isArray(data) ? data : list);
        load();
      })
      .finally(() => setSavingOrder(false));
  }

  const inCurationIds = new Set(list.map((i) => i.productId));
  const availableProducts = products.filter((p) => !inCurationIds.has(p.id));

  if (loading) return <p className="text-gray-500">로딩 중…</p>;

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">고객님을 위한 상품</h1>
      <p className="mt-1 text-sm text-gray-500">마이페이지의 「고객님을 위한 상품」 섹션에 노출할 상품과 순서를 관리합니다. 상품을 추가하고 위아래로 순서를 조정할 수 있습니다.</p>

      <div className="mt-6 flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700">상품 추가</label>
          <select value={addProductId} onChange={(e) => setAddProductId(e.target.value)} className="mt-1 rounded-md border border-gray-300 px-3 py-2 text-sm">
            <option value="">선택</option>
            {availableProducts.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
        <button type="button" disabled={adding || !addProductId} onClick={handleAdd} className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50">
          {adding ? '추가 중…' : '추가'}
        </button>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>

      {list.length === 0 ? (
        <p className="mt-6 text-gray-500">큐레이션에 등록된 상품이 없습니다. 승인된 상품을 추가해 주세요.</p>
      ) : (
        <ul className="mt-6 space-y-2">
          {list.map((item, index) => (
            <li key={item.id} className="flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-3">
              <span className="w-8 text-sm font-medium text-gray-500">{index + 1}</span>
              <div className="flex gap-2">
                <button type="button" disabled={savingOrder || index === 0} onClick={() => moveUp(index)} className="rounded border border-gray-300 px-2 py-1 text-xs disabled:opacity-50">▲</button>
                <button type="button" disabled={savingOrder || index === list.length - 1} onClick={() => moveDown(index)} className="rounded border border-gray-300 px-2 py-1 text-xs disabled:opacity-50">▼</button>
              </div>
              <div className="h-12 w-12 shrink-0 overflow-hidden rounded border bg-gray-100">
                {item.product?.images?.[0]?.url ? <img src={item.product.images[0].url} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-xs text-gray-400">-</div>}
              </div>
              <div className="min-w-0 flex-1">
                <Link href={`/admin/products/${item.productId}`} className="font-medium text-gray-900 hover:underline">{item.product?.name}</Link>
                <p className="text-sm text-gray-500">{item.product?.basePrice?.toLocaleString()}원</p>
              </div>
              <button type="button" onClick={() => handleRemove(item.id)} className="text-sm text-red-600 hover:underline">제거</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
