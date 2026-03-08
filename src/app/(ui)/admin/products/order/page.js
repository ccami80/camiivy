'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

function getToken() {
  return typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
}

export default function AdminProductOrderPage() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function load() {
    const token = getToken();
    if (!token) return;
    fetch('/api/admin/products?status=APPROVED', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => (r.ok ? r.json() : []))
      .then((arr) => {
        const sorted = [...(Array.isArray(arr) ? arr : [])].sort((a, b) => {
          const ao = a.displayOrder != null ? a.displayOrder : 999999;
          const bo = b.displayOrder != null ? b.displayOrder : 999999;
          return ao - bo || new Date(b.createdAt) - new Date(a.createdAt);
        });
        setList(sorted);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  function moveUp(index) {
    if (index <= 0) return;
    const next = [...list];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    setList(next);
  }

  function moveDown(index) {
    if (index >= list.length - 1) return;
    const next = [...list];
    [next[index], next[index + 1]] = [next[index + 1], next[index]];
    setList(next);
  }

  function handleSave() {
    setSaving(true);
    setError('');
    fetch('/api/admin/products/order', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify({ productIds: list.map((p) => p.id) }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        load();
      })
      .catch((err) => setError(err.message))
      .finally(() => setSaving(false));
  }

  if (loading) return <p className="text-gray-500">로딩 중…</p>;

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">상품 노출 순서</h1>
      <p className="mt-1 text-sm text-gray-500">승인된 상품의 목록 노출 순서를 조정합니다. 상단이 사용자 목록에서 먼저 노출됩니다.</p>

      {error && <div className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <div className="mt-6 flex justify-end">
        <button type="button" disabled={saving} onClick={handleSave} className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50">
          {saving ? '저장 중…' : '순서 저장'}
        </button>
      </div>

      {list.length === 0 ? (
        <p className="mt-6 text-gray-500">승인된 상품이 없습니다.</p>
      ) : (
        <ul className="mt-6 space-y-2">
          {list.map((product, index) => (
            <li key={product.id} className="flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-3">
              <span className="w-8 text-sm font-medium text-gray-500">{index + 1}</span>
              <div className="flex gap-2">
                <button type="button" disabled={index === 0} onClick={() => moveUp(index)} className="rounded border border-gray-300 px-2 py-1 text-xs disabled:opacity-50">▲</button>
                <button type="button" disabled={index === list.length - 1} onClick={() => moveDown(index)} className="rounded border border-gray-300 px-2 py-1 text-xs disabled:opacity-50">▼</button>
              </div>
              <div className="h-12 w-12 shrink-0 overflow-hidden rounded border bg-gray-100">
                {product.images?.[0]?.url ? <img src={product.images[0].url} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-xs text-gray-400">-</div>}
              </div>
              <div className="min-w-0 flex-1">
                <Link href={`/admin/products/${product.id}`} className="font-medium text-gray-900 hover:underline">{product.name}</Link>
                <p className="text-sm text-gray-500">{product.basePrice?.toLocaleString()}원 · {product.approvalStatus}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
