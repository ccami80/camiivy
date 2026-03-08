'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';

const ADMIN_TOKEN_KEY = 'adminToken';
const PET_TYPES = [{ value: 'DOG', label: '강아지' }];

/** flat 목록을 상위/하위 트리로 변환. { roots: [], childrenByParentId: { [parentId]: [] } } */
function buildCategoryTree(categories, petType) {
  const list = (categories || []).filter((c) => c.petType === petType);
  const roots = list.filter((c) => !c.parentId).sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  const childrenByParentId = {};
  list.filter((c) => c.parentId).forEach((c) => {
    if (!childrenByParentId[c.parentId]) childrenByParentId[c.parentId] = [];
    childrenByParentId[c.parentId].push(c);
  });
  Object.keys(childrenByParentId).forEach((pid) => {
    childrenByParentId[pid].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  });
  return { roots, childrenByParentId };
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submittingParent, setSubmittingParent] = useState(false);
  const [submittingChild, setSubmittingChild] = useState(false);
  const [formParent, setFormParent] = useState({
    name: '',
    slug: '',
    petType: 'DOG',
    sortOrder: '0',
  });
  const [formChild, setFormChild] = useState({
    parentId: '',
    name: '',
    slug: '',
    sortOrder: '0',
  });

  function getToken() {
    return typeof window !== 'undefined' ? localStorage.getItem(ADMIN_TOKEN_KEY) : null;
  }

  function fetchCategories() {
    const token = getToken();
    if (!token) return;
    setLoading(true);
    fetch('/api/admin/categories', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => (r.ok ? r.json() : []))
      .then(setCategories)
      .catch(() => setError('목록을 불러올 수 없습니다.'))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchCategories();
  }, []);

  function handleParentChange(e) {
    const { name, value } = e.target;
    setFormParent((prev) => {
      const next = { ...prev, [name]: value };
      if (name === 'name' && !prev.slug) {
        next.slug = value.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9가-힣-]/g, '');
      }
      return next;
    });
  }

  function handleChildChange(e) {
    const { name, value } = e.target;
    setFormChild((prev) => {
      const next = { ...prev, [name]: value };
      if (name === 'name' && !prev.slug) {
        next.slug = value.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9가-힣-]/g, '');
      }
      return next;
    });
  }

  function handleSubmitParent(e) {
    e.preventDefault();
    setError('');
    setSubmittingParent(true);
    const token = getToken();
    if (!token) {
      setError('로그인이 필요합니다.');
      setSubmittingParent(false);
      return;
    }
    fetch('/api/admin/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        name: formParent.name.trim(),
        slug: formParent.slug.trim() || formParent.name.trim().toLowerCase().replace(/\s+/g, '-'),
        petType: formParent.petType,
        sortOrder: formParent.sortOrder === '' ? 0 : Number(formParent.sortOrder),
      }),
    })
      .then((r) => {
        if (!r.ok) return r.json().then((d) => { throw new Error(d.error || '추가 실패'); });
        return r.json();
      })
      .then(() => {
        setFormParent({ name: '', slug: '', petType: 'DOG', sortOrder: '0' });
        fetchCategories();
      })
      .catch((err) => setError(err.message || '추가 중 오류가 발생했습니다.'))
      .finally(() => setSubmittingParent(false));
  }

  function handleSubmitChild(e) {
    e.preventDefault();
    setError('');
    if (!formChild.parentId?.trim()) {
      setError('상위 카테고리를 선택하세요.');
      return;
    }
    setSubmittingChild(true);
    const token = getToken();
    if (!token) {
      setError('로그인이 필요합니다.');
      setSubmittingChild(false);
      return;
    }
    const parent = categories.find((c) => c.id === formChild.parentId);
    fetch('/api/admin/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        name: formChild.name.trim(),
        slug: formChild.slug.trim() || formChild.name.trim().toLowerCase().replace(/\s+/g, '-'),
        petType: parent?.petType || 'DOG',
        sortOrder: formChild.sortOrder === '' ? 0 : Number(formChild.sortOrder),
        parentId: formChild.parentId.trim(),
      }),
    })
      .then((r) => {
        if (!r.ok) return r.json().then((d) => { throw new Error(d.error || '추가 실패'); });
        return r.json();
      })
      .then(() => {
        setFormChild({ parentId: '', name: '', slug: '', sortOrder: '0' });
        fetchCategories();
      })
      .catch((err) => setError(err.message || '추가 중 오류가 발생했습니다.'))
      .finally(() => setSubmittingChild(false));
  }

  const treeDOG = useMemo(() => buildCategoryTree(categories, 'DOG'), [categories]);
  const rootCategories = useMemo(
    () => categories.filter((c) => !c.parentId).sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
    [categories]
  );

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">카테고리 관리</h1>
        <Link href="/admin" className="text-sm font-medium text-gray-600 hover:text-gray-900">← 대시보드</Link>
      </div>
      <p className="mt-1 text-sm text-gray-500">
        여기서 추가한 카테고리는 입점업체 상품 등록 시 브랜드·반려동물 타입 아래 카테고리 선택 목록에 나타납니다.
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <section className="space-y-8">
          {error && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">{error}</p>
          )}

          {/* 상위 카테고리만 있으면 하위가 없는 거 → 상위 추가 폼 */}
          <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-4">
            <h2 className="text-sm font-semibold text-gray-800">상위 카테고리</h2>
            <p className="mt-1 text-xs text-gray-500">상위만 넣을 때 사용. (하위 없음)</p>
            <form onSubmit={handleSubmitParent} className="mt-4 space-y-4">
              <div>
                <label htmlFor="parent-name" className="block text-sm font-medium text-gray-700">이름 *</label>
                <input
                  id="parent-name"
                  name="name"
                  type="text"
                  required
                  value={formParent.name}
                  onChange={handleParentChange}
                  placeholder="예: 배변용품"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
                />
              </div>
              <div>
                <label htmlFor="parent-slug" className="block text-sm font-medium text-gray-700">slug *</label>
                <input
                  id="parent-slug"
                  name="slug"
                  type="text"
                  required
                  value={formParent.slug}
                  onChange={handleParentChange}
                  placeholder="예: toilet"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
                />
              </div>
              <div>
                <label htmlFor="parent-petType" className="block text-sm font-medium text-gray-700">반려동물 타입 *</label>
                <select
                  id="parent-petType"
                  name="petType"
                  value={formParent.petType}
                  onChange={handleParentChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
                >
                  {PET_TYPES.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="parent-sortOrder" className="block text-sm font-medium text-gray-700">정렬 순서</label>
                <input
                  id="parent-sortOrder"
                  name="sortOrder"
                  type="number"
                  min="0"
                  value={formParent.sortOrder}
                  onChange={handleParentChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
                />
              </div>
              <button
                type="submit"
                disabled={submittingParent}
                className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
              >
                {submittingParent ? '추가 중…' : '상위 카테고리 추가'}
              </button>
            </form>
          </div>

          {/* 하위 카테고리 추가 폼 */}
          <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-4">
            <h2 className="text-sm font-semibold text-gray-800">하위 카테고리</h2>
            <p className="mt-1 text-xs text-gray-500">어떤 상위 아래에 넣을지 고른 뒤, 하위 이름·slug 입력.</p>
            <form onSubmit={handleSubmitChild} className="mt-4 space-y-4">
              <div>
                <label htmlFor="child-parentId" className="block text-sm font-medium text-gray-700">상위 카테고리 *</label>
                <select
                  id="child-parentId"
                  name="parentId"
                  value={formChild.parentId}
                  onChange={handleChildChange}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
                >
                  <option value="">선택하세요</option>
                  {rootCategories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} ({c.slug})</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="child-name" className="block text-sm font-medium text-gray-700">하위 이름 *</label>
                <input
                  id="child-name"
                  name="name"
                  type="text"
                  required
                  value={formChild.name}
                  onChange={handleChildChange}
                  placeholder="예: 배변패드"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
                />
              </div>
              <div>
                <label htmlFor="child-slug" className="block text-sm font-medium text-gray-700">하위 slug *</label>
                <input
                  id="child-slug"
                  name="slug"
                  type="text"
                  required
                  value={formChild.slug}
                  onChange={handleChildChange}
                  placeholder="예: pee-pads"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
                />
              </div>
              <div>
                <label htmlFor="child-sortOrder" className="block text-sm font-medium text-gray-700">정렬 순서</label>
                <input
                  id="child-sortOrder"
                  name="sortOrder"
                  type="number"
                  min="0"
                  value={formChild.sortOrder}
                  onChange={handleChildChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
                />
              </div>
              <button
                type="submit"
                disabled={submittingChild || !formChild.parentId}
                className="rounded-md bg-gray-700 px-4 py-2 text-sm font-medium text-white hover:bg-gray-600 disabled:opacity-50"
              >
                {submittingChild ? '추가 중…' : '하위 카테고리 추가'}
              </button>
            </form>
          </div>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-gray-800">등록된 카테고리</h2>
          <p className="mt-0.5 text-xs text-gray-500">상위 카테고리 → 하위 카테고리 → 세부 카테고리 순으로 정리됩니다.</p>
          {loading ? (
            <p className="mt-4 text-gray-500">로딩 중…</p>
          ) : (
            <div className="mt-4 space-y-6">
              <div>
                <p className="text-xs font-medium text-gray-500">강아지 (DOG)</p>
                <ul className="mt-2 rounded-lg border border-gray-200 bg-white divide-y divide-gray-100 overflow-hidden">
                  {treeDOG.roots.length === 0 ? (
                    <li className="px-4 py-3 text-sm text-gray-500">없음</li>
                  ) : (
                    treeDOG.roots.map((root) => {
                      const children = treeDOG.childrenByParentId[root.id] || [];
                      return (
                        <li key={root.id}>
                          <div className="px-4 py-3 flex justify-between text-sm bg-gray-50/50">
                            <span className="font-medium text-gray-900">
                              <span className="text-xs font-normal text-gray-500 mr-1.5">상위</span>
                              {root.name}
                            </span>
                            <span className="rounded bg-gray-100 px-2 py-0.5 font-mono text-gray-600 text-xs">{root.slug}</span>
                          </div>
                          {children.length > 0 && (
                            <ul className="border-t border-gray-100">
                              {children.map((child) => {
                                const grandChildren = treeDOG.childrenByParentId[child.id] || [];
                                return (
                                  <li key={child.id} className="border-t border-gray-100">
                                    <div className="pl-6 pr-4 py-2 flex justify-between text-sm bg-white">
                                      <span className="text-gray-800">
                                        <span className="text-xs text-gray-500 mr-1.5">하위</span>
                                        {child.name}
                                      </span>
                                      <span className="rounded bg-gray-100 px-2 py-0.5 font-mono text-gray-600 text-xs">{child.slug}</span>
                                    </div>
                                    {grandChildren.length > 0 && (
                                      <ul className="border-t border-gray-50 bg-gray-50/30">
                                        {grandChildren.map((gc) => (
                                          <li key={gc.id} className="pl-10 pr-4 py-1.5 flex justify-between text-sm border-t border-gray-50">
                                            <span className="text-gray-700 text-xs">
                                              <span className="text-gray-400 mr-1.5">세부</span>
                                              {gc.name}
                                            </span>
                                            <span className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-gray-500 text-xs">{gc.slug}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    )}
                                  </li>
                                );
                              })}
                            </ul>
                          )}
                        </li>
                      );
                    })
                  )}
                </ul>
              </div>
            </div>
          )}
        </section>
      </div>

      <div className="mt-8 rounded-lg border border-blue-100 bg-blue-50/50 p-4 text-sm text-blue-900">
        <p className="font-medium">샘플 등록 방법</p>
        <p className="mt-1"><strong>한 번에 넣기:</strong> 터미널에서 <code className="rounded bg-blue-100 px-1">npm run db:seed</code> 실행 시 상위/하위 샘플이 자동 등록됩니다.</p>
        <p className="mt-3"><strong>직접 넣을 때:</strong> 왼쪽 <strong>상위 카테고리</strong> 칸에서 배변용품(toilet) 등 추가 → <strong>하위 카테고리</strong> 칸에서 상위를 선택한 뒤 배변패드(pee-pads) 등 추가.</p>
      </div>
      <div className="mt-4 rounded-lg border border-amber-100 bg-amber-50/50 p-4 text-sm text-amber-800">
        <p className="font-medium">브랜드 추가 방법</p>
        <p className="mt-1">
          브랜드(까미/아이비 등)는 코드에서 관리합니다. <code className="rounded bg-amber-100 px-1">src/lib/constants.js</code> 파일의 <code className="rounded bg-amber-100 px-1">BRANDS</code> 배열에 <code className="rounded bg-amber-100 px-1">{`{ value: '코드값', label: '표시명' }`}</code> 형태로 추가하면 상품 등록 폼에 반영됩니다.
        </p>
      </div>
    </div>
  );
}
