'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

function getToken() {
  return typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
}

const SECTIONS = [
  { key: 'NEW_BEST', label: '신상품 베스트', description: '메인 페이지 「신상품 베스트」 섹션 (최대 6개 권장)' },
  { key: 'BEST', label: '베스트 상품', description: '메인 페이지 「베스트 상품」 섹션 (최대 4개 권장)' },
];

function SectionBlock({ sectionKey, label, description, list, products, onAdd, onRemove, onMoveUp, onMoveDown, saveOrder, adding, savingOrder, error }) {
  const [addProductId, setAddProductId] = useState('');
  const idsInSection = new Set(list.map((i) => i.productId));
  const availableProducts = products.filter((p) => !idsInSection.has(p.id));

  function handleAdd() {
    if (!addProductId) return;
    onAdd(sectionKey, addProductId);
    setAddProductId('');
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-gray-900">{label}</h2>
      <p className="mt-1 text-sm text-gray-500">{description}</p>
      <div className="mt-4 flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700">상품 추가</label>
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
        <p className="mt-4 text-sm text-gray-500">등록된 상품이 없습니다. 설정이 없으면 메인에서 CAMI 승인 상품으로 자동 노출됩니다.</p>
      ) : (
        <ul className="mt-4 space-y-2">
          {list.map((item, index) => (
            <li key={item.id} className="flex items-center gap-4 rounded-lg border border-gray-100 bg-gray-50/50 p-3">
              <span className="w-8 text-sm font-medium text-gray-500">{index + 1}</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={savingOrder || index === 0}
                  onClick={() => onMoveUp(sectionKey, index)}
                  className="rounded border border-gray-300 px-2 py-1 text-xs disabled:opacity-50"
                >▲</button>
                <button
                  type="button"
                  disabled={savingOrder || index === list.length - 1}
                  onClick={() => onMoveDown(sectionKey, index)}
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
              <button type="button" onClick={() => onRemove(item.id)} className="text-sm text-red-600 hover:underline">제거</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function AdminHomeSectionsPage() {
  const [products, setProducts] = useState([]);
  const [lists, setLists] = useState({ NEW_BEST: [], BEST: [] });
  const [loading, setLoading] = useState(true);
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

  function loadList(section) {
    const token = getToken();
    if (!token) return;
    fetch(`/api/admin/home-sections?section=${section}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        setLists((prev) => ({ ...prev, [section]: Array.isArray(data) ? data : [] }));
      });
  }

  useEffect(() => {
    loadProducts();
    loadList('NEW_BEST');
    loadList('BEST');
  }, []);

  function handleAdd(section, productId) {
    setAdding(true);
    setError('');
    fetch('/api/admin/home-sections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify({ section, productId }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setError('');
        loadList(section);
      })
      .catch((err) => setError(err.message))
      .finally(() => setAdding(false));
  }

  function handleRemove(id) {
    if (!confirm('이 섹션에서 제거하시겠습니까?')) return;
    fetch(`/api/admin/home-sections/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${getToken()}` } })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        loadList('NEW_BEST');
        loadList('BEST');
      });
  }

  function moveUp(section, index) {
    const list = lists[section];
    if (index <= 0) return;
    const next = [...list];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    saveOrder(section, next.map((i) => i.id));
  }

  function moveDown(section, index) {
    const list = lists[section];
    if (index >= list.length - 1) return;
    const next = [...list];
    [next[index], next[index + 1]] = [next[index + 1], next[index]];
    saveOrder(section, next.map((i) => i.id));
  }

  function saveOrder(section, ids) {
    setSavingOrder(true);
    fetch('/api/admin/home-sections', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify({ section, order: ids }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setLists((prev) => ({ ...prev, [section]: Array.isArray(data) ? data : lists[section] }));
        loadList(section);
      })
      .finally(() => setSavingOrder(false));
  }

  if (loading) return <p className="text-gray-500">로딩 중…</p>;

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">메인 페이지 섹션</h1>
      <p className="mt-1 text-sm text-gray-500">
        메인 페이지(/)의 「신상품 베스트」「베스트 상품」에 노출할 상품과 순서를 관리합니다. 설정이 없으면 CAMI 승인 상품으로 자동 노출됩니다.
      </p>
      <Link href="/" target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-sm text-blue-600 hover:underline">
        메인 페이지 보기 →
      </Link>

      <div className="mt-8 space-y-8">
        {SECTIONS.map(({ key, label, description }) => (
          <SectionBlock
            key={key}
            sectionKey={key}
            label={label}
            description={description}
            list={lists[key] || []}
            products={products}
            onAdd={handleAdd}
            onRemove={handleRemove}
            onMoveUp={moveUp}
            onMoveDown={moveDown}
            saveOrder={saveOrder}
            adding={adding}
            savingOrder={savingOrder}
            error={error}
          />
        ))}
      </div>
    </div>
  );
}
