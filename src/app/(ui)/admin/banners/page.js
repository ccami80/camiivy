'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { DUMMY_BANNERS } from '@/data/dummyBanners';

function getToken() {
  return typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
}

export default function AdminBannersPage() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDummy, setIsDummy] = useState(false); // true면 더미 표시 중 (수정/삭제 비활성)
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ imageUrl: '', linkUrl: '', title: '', description: '', isActive: true });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [listError, setListError] = useState(''); // 삭제 등 목록 작업 오류

  function load() {
    const token = getToken();
    if (!token) {
      setLoading(false);
      setList(DUMMY_BANNERS);
      setIsDummy(true);
      return;
    }
    fetch('/api/admin/banners', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        const items = Array.isArray(data) ? data : [];
        if (items.length === 0) {
          setList(DUMMY_BANNERS);
          setIsDummy(true);
        } else {
          setList(items);
          setIsDummy(false);
        }
      })
      .catch(() => {
        setList(DUMMY_BANNERS);
        setIsDummy(true);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  function openAdd() {
    setModal('add');
    setForm({ imageUrl: '', linkUrl: '', title: '', description: '', isActive: true });
    setError('');
  }

  function openEdit(banner) {
    if (isDummy) return;
    setModal(banner.id);
    setForm({
      imageUrl: banner.imageUrl || '',
      linkUrl: banner.linkUrl || '',
      title: banner.title || '',
      description: banner.description || '',
      isActive: banner.isActive !== false,
    });
    setError('');
  }

  async function handleImageUpload(e) {
    const file = e.target?.files?.[0];
    if (!file) return;
    setError('');
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('files', file);
      const token = getToken();
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '업로드 실패');
      const url = data.urls?.[0];
      if (url) setForm((f) => ({ ...f, imageUrl: url }));
    } catch (err) {
      setError(err.message || '이미지 업로드에 실패했습니다.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const imageUrl = form.imageUrl?.trim();
    if (!imageUrl) {
      setError('이미지를 선택해 주세요.');
      return;
    }
    setSaving(true);
    const token = getToken();
    const url = modal === 'add' ? '/api/admin/banners' : `/api/admin/banners/${modal}`;
    const method = modal === 'add' ? 'POST' : 'PATCH';
    const body = { ...form, imageUrl };
    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setModal(null);
        load();
      })
      .catch((err) => setError(err.message))
      .finally(() => setSaving(false));
  }

  function handleDelete(id) {
    if (isDummy) return;
    if (!confirm('이 배너를 삭제하시겠습니까?')) return;
    setListError('');
    fetch(`/api/admin/banners/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${getToken()}` } })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        load();
      })
      .catch((err) => setListError(err.message || '삭제에 실패했습니다.'));
  }

  if (loading) return <p className="text-gray-500">로딩 중…</p>;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">배너 관리</h1>
        <button type="button" onClick={openAdd} className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800">
          배너 추가
        </button>
      </div>
      <p className="mt-1 text-sm text-gray-500">메인 페이지 상단 배너를 관리합니다. 순서는 목록 순서대로 노출됩니다.</p>

      {isDummy && (
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <strong>미리보기:</strong> 등록된 배너가 없어 더미 데이터를 표시합니다. &quot;배너 추가&quot;로 이미지를 올려 저장하면 메인 페이지에 노출되며, <strong>수정·삭제는 저장된 배너에만</strong> 적용됩니다.
        </div>
      )}

      {listError && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {listError}
        </div>
      )}

      {list.length === 0 ? (
        <p className="mt-6 text-gray-500">등록된 배너가 없습니다.</p>
      ) : (
        <ul className="mt-6 space-y-4">
          {list.map((banner, idx) => (
            <li key={banner.id} className="flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-4">
              <span className="text-sm font-medium text-gray-400">#{idx + 1}</span>
              <div className="h-16 w-40 shrink-0 overflow-hidden rounded border bg-gray-100">
                <img src={banner.imageUrl} alt="" className="h-full w-full object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-gray-900">{banner.title || '(제목 없음)'}</p>
                {banner.description ? <p className="mt-0.5 line-clamp-2 text-sm text-gray-600">{banner.description}</p> : null}
                <p className="mt-1 text-sm text-gray-500">{banner.linkUrl || '링크 없음'}</p>
                <span className={`mt-1 inline-block rounded px-2 py-0.5 text-xs ${banner.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                  {banner.isActive ? '노출 중' : '비노출'}
                </span>
              </div>
              <div className="flex shrink-0 gap-2">
                <button type="button" onClick={() => openEdit(banner)} className="text-sm font-medium text-gray-700 hover:underline" disabled={isDummy} title={isDummy ? '저장된 배너만 수정할 수 있습니다' : '수정'}>수정</button>
                <button type="button" onClick={() => handleDelete(banner.id)} className="text-sm text-red-600 hover:underline" disabled={isDummy} title={isDummy ? '저장된 배너만 삭제할 수 있습니다' : '삭제'}>삭제</button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <h2 className="text-lg font-semibold">{modal === 'add' ? '배너 추가' : '배너 수정'}</h2>
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              {error && <p className="text-sm text-red-600">{error}</p>}
              <div>
                <label className="block text-sm font-medium text-gray-700">이미지 *</label>
                <div className="mt-1 flex flex-col gap-2">
                  {form.imageUrl ? (
                    <div className="flex items-start gap-3">
                      <div className="h-20 w-28 shrink-0 overflow-hidden rounded border bg-gray-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={form.imageUrl} alt="" className="h-full w-full object-cover" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-gray-500">업로드된 이미지. 아래에서 다시 선택하면 교체됩니다.</p>
                        <button type="button" onClick={() => setForm((f) => ({ ...f, imageUrl: '' }))} className="mt-1 text-xs text-red-600 hover:underline">이미지 제거</button>
                      </div>
                    </div>
                  ) : null}
                  <label className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-md border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-sm text-gray-600 transition hover:border-gray-400 hover:bg-gray-100 ${uploading ? 'pointer-events-none opacity-60' : ''}`}>
                    <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" disabled={uploading} onChange={handleImageUpload} />
                    {uploading ? '업로드 중…' : (form.imageUrl ? '다른 이미지로 변경' : '이미지 선택 (JPG, PNG, WebP, GIF, 5MB 이하)')}
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">링크 URL</label>
                <input type="url" value={form.linkUrl} onChange={(e) => setForm((f) => ({ ...f, linkUrl: e.target.value }))} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" placeholder="https://... 또는 /products" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">제목 (짧은 라벨, 선택)</label>
                <input type="text" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" placeholder="예: OPEN" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">노출 문구 (설명)</label>
                <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={3} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" placeholder="메인에 배너 아래에 표시할 문구. 예: 빌레로이앤보흐 독일 프리미엄 명품도자기 빌레로이앤보흐" />
                <p className="mt-1 text-xs text-gray-500">배너 카드 하단에 이 문구가 노출됩니다.</p>
              </div>
              {modal !== 'add' && (
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="isActive" checked={form.isActive} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))} className="rounded border-gray-300" />
                  <label htmlFor="isActive" className="text-sm text-gray-700">노출</label>
                </div>
              )}
              <div className="flex gap-2 pt-2">
                <button type="submit" disabled={saving} className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50">{saving ? '저장 중…' : '저장'}</button>
                <button type="button" onClick={() => setModal(null)} className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">취소</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
