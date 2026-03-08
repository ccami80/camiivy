'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';

const USER_TOKEN_KEY = 'userToken';

export default function MyReviewsPage() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({ rating: 5, content: '', bodyType: '', petType: '', imageUrls: [] });
  const [saving, setSaving] = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);
  const [error, setError] = useState('');

  function getToken() {
    return typeof window !== 'undefined' ? localStorage.getItem(USER_TOKEN_KEY) : null;
  }

  const load = useCallback(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      setList([]);
      return;
    }
    fetch('/api/user/reviews', { headers: { Authorization: `Bearer ${token}` }, credentials: 'include' })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setList(Array.isArray(data) ? data : []))
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function parseImageUrls(v) {
    if (!v) return [];
    if (Array.isArray(v)) return v;
    try {
      return JSON.parse(v) || [];
    } catch (_) {
      return [];
    }
  }

  function openEdit(review) {
    setEditing(review.id);
    setEditForm({
      rating: review.rating,
      content: review.content,
      bodyType: review.bodyType ?? '',
      petType: review.petType ?? '',
      imageUrls: parseImageUrls(review.imageUrls),
    });
    setError('');
  }

  async function addEditImage(files) {
    if (!files?.length) return;
    setUploadingImg(true);
    setError('');
    try {
      const formData = new FormData();
      for (let i = 0; i < Math.min(files.length, 10 - editForm.imageUrls.length); i++) {
        formData.append('files', files[i]);
      }
      const res = await fetch('/api/user/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '업로드 실패');
      setEditForm((f) => ({ ...f, imageUrls: [...f.imageUrls, ...(data.urls || [])].slice(0, 10) }));
    } catch (err) {
      setError(err.message || '이미지 업로드에 실패했습니다.');
    }
    setUploadingImg(false);
  }

  function handleUpdate(e) {
    e.preventDefault();
    if (!editing) return;
    setError('');
    setSaving(true);
    const token = getToken();
    if (!token) return;
    fetch(`/api/user/reviews/${editing}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        rating: editForm.rating,
        content: editForm.content.trim(),
        bodyType: editForm.bodyType.trim() || undefined,
        petType: editForm.petType || undefined,
        imageUrls: editForm.imageUrls.length ? editForm.imageUrls : undefined,
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setEditing(null);
        load();
      })
      .catch((err) => setError(err.message))
      .finally(() => setSaving(false));
  }

  function handleDelete(id) {
    if (!confirm('리뷰를 삭제하시겠습니까?')) return;
    const token = getToken();
    if (!token) return;
    fetch(`/api/user/reviews/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setEditing(null);
        load();
      });
  }

  if (loading) return <p className="text-gray-500">로딩 중…</p>;

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">리뷰 관리</h1>
      <p className="mt-1 text-sm text-gray-500">구매한 상품에 대해 리뷰를 작성·수정할 수 있습니다. 주문 상세(결제 완료 건)에서 「리뷰 작성」으로 이동하거나, 상품 상세에서 구매 후 작성하세요.</p>
      {list.length === 0 ? (
        <p className="mt-6 text-gray-500">작성한 리뷰가 없습니다.</p>
      ) : (
        <ul className="mt-6 space-y-4">
          {list.map((review) => (
            <li key={review.id} className="rounded-lg border border-gray-200 bg-white p-4">
              {editing === review.id ? (
                <form onSubmit={handleUpdate} className="space-y-3">
                  {error && <p className="text-sm text-red-600">{error}</p>}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">평점 (1~5)</label>
                    <select value={editForm.rating} onChange={(e) => setEditForm((f) => ({ ...f, rating: Number(e.target.value) }))} className="mt-1 rounded-md border border-gray-300 px-3 py-2">
                      {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}점</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">종</label>
                    <select value={editForm.petType} onChange={(e) => setEditForm((f) => ({ ...f, petType: e.target.value }))} className="mt-1 rounded-md border border-gray-300 px-3 py-2">
                      <option value="">선택</option>
                      <option value="DOG">강아지</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">체형</label>
                    <input type="text" value={editForm.bodyType} onChange={(e) => setEditForm((f) => ({ ...f, bodyType: e.target.value }))} placeholder="예: 소형, 중형" className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">내용</label>
                    <textarea value={editForm.content} onChange={(e) => setEditForm((f) => ({ ...f, content: e.target.value }))} rows={3} required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">사진</label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {editForm.imageUrls.map((url, i) => (
                        <div key={i} className="relative">
                          <img src={url} alt="" className="h-16 w-16 rounded border object-cover" />
                          <button type="button" onClick={() => setEditForm((f) => ({ ...f, imageUrls: f.imageUrls.filter((_, j) => j !== i) }))} className="absolute -right-1 -top-1 rounded-full bg-red-500 px-1 py-0.5 text-xs text-white">×</button>
                        </div>
                      ))}
                      {editForm.imageUrls.length < 10 && (
                        <label className="flex h-16 w-16 cursor-pointer items-center justify-center rounded border-2 border-dashed border-gray-300 text-xs text-gray-500">
                          <input type="file" accept="image/*" multiple className="hidden" disabled={uploadingImg} onChange={(e) => addEditImage(e.target.files)} />
                          {uploadingImg ? '…' : '+'}
                        </label>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" disabled={saving} className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50">저장</button>
                    <button type="button" onClick={() => setEditing(null)} className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">취소</button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="flex items-start justify-between gap-2">
                    <Link href={`/products/${review.productId}`} className="font-medium text-gray-900 hover:underline">
                      {review.product?.name}
                    </Link>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => openEdit(review)} className="text-sm text-gray-600 hover:underline">수정</button>
                      <button type="button" onClick={() => handleDelete(review.id)} className="text-sm text-red-600 hover:underline">삭제</button>
                    </div>
                  </div>
                  <p className="mt-1 text-sm text-amber-600">★ {review.rating}점</p>
                  {(review.bodyType || review.petType) && (
                    <p className="mt-0.5 text-xs text-gray-500">
                      {review.petType === 'DOG' ? '강아지' : review.petType === 'CAT' ? '고양이' : ''}
                      {review.petType && review.bodyType ? ' · ' : ''}{review.bodyType || ''}
                    </p>
                  )}
                  <p className="mt-2 text-sm text-gray-600 whitespace-pre-wrap">{review.content}</p>
                  {parseImageUrls(review.imageUrls).length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {parseImageUrls(review.imageUrls).map((url, i) => (
                        <img key={i} src={url} alt="" className="h-16 w-16 rounded border object-cover" />
                      ))}
                    </div>
                  )}
                  <p className="mt-2 text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString('ko-KR')}</p>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
