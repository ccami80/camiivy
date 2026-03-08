'use client';

import { useState, useEffect, useCallback } from 'react';

const USER_TOKEN_KEY = 'userToken';
const BODY_TYPE_OPTIONS = ['전체', '소형견', '중형견', '대형견', '소형고양이', '중형고양이'];

/** 별점 1~5를 ★/☆로 표시 (리뷰 별점 스타일). inactive면 전부 회색 ☆ */
function StarRating({ rating, max = 5, size = 'md', inactive = false }) {
  const value = Math.min(max, Math.max(0, Number(rating) || 0));
  const full = inactive ? 0 : Math.floor(value);
  const half = inactive ? 0 : value - full >= 0.5 ? 1 : 0;
  const empty = max - full - half;
  const starClass = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';
  const filledClass = inactive ? 'text-gray-300' : 'text-amber-500';
  const emptyClass = 'text-gray-300';
  return (
    <span className="inline-flex items-center gap-0.5" role="img" aria-label={`${value}점`}>
      {Array.from({ length: full }, (_, i) => (
        <span key={`f-${i}`} className={`${starClass} ${filledClass}`} aria-hidden>★</span>
      ))}
      {half ? (
        <span className={`${starClass} ${filledClass} opacity-90`} aria-hidden>★</span>
      ) : null}
      {Array.from({ length: empty }, (_, i) => (
        <span key={`e-${i}`} className={`${starClass} ${emptyClass}`} aria-hidden>☆</span>
      ))}
    </span>
  );
}

/**
 * 이용자 평점 총 5점 중 X.X점 + 별 + 평점 비율(바) (VIP overview 스타일)
 */
function VipOverviewBox({ summary }) {
  const count = summary?.count ?? 0;
  const average = count > 0 ? summary.average : 0;
  const dist = summary?.distribution ?? { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  const total = count;
  const rows = [5, 4, 3, 2, 1].map((star) => ({
    star,
    pct: total ? Math.round(((dist[star] ?? 0) / total) * 100) : 0,
  }));

  const hasRating = count > 0;

  return (
    <div
      className="box__vip-overview rounded-lg border border-gray-200 bg-gray-50/80 px-6 py-5"
      style={{ maxWidth: 860, minHeight: 189 }}
    >
      <div className="flex flex-col gap-6 sm:flex-row sm:items-stretch sm:justify-between">
        <div className="flex flex-col justify-center">
          <p className="text-sm font-medium text-gray-600">이용자 평점</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">
            총 5점 중{' '}
            <span className={hasRating ? 'text-amber-600' : 'text-gray-400'}>{average}</span> 점
          </p>
          <div className="mt-2">
            <StarRating rating={average} inactive={!hasRating} size="md" />
          </div>
        </div>
        <div className="flex-1 sm:pl-8 sm:min-w-[280px]">
          <p className="mb-3 text-sm font-medium text-gray-600">평점 비율</p>
          <div className="space-y-2">
            {rows.map(({ star, pct }) => (
              <div key={star} className="flex items-center gap-3">
                <span className="w-8 shrink-0 text-sm text-gray-600">{star}점</span>
                <div className="min-w-0 flex-1 h-2 rounded-full bg-gray-200 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-amber-400 transition-all duration-300"
                    style={{ width: `${pct}%`, backgroundColor: hasRating ? undefined : 'transparent' }}
                  />
                </div>
                <span className={`w-10 shrink-0 text-right text-sm font-semibold tabular-nums ${hasRating ? 'text-gray-900' : 'text-gray-400'}`}>
                  {pct}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function parseImageUrls(v) {
  if (!v) return [];
  if (Array.isArray(v)) return v;
  try {
    return JSON.parse(v) || [];
  } catch (_) {
    return [];
  }
}

export default function ReviewSection({ productId, productName = '' }) {
  const [bodyFilter, setBodyFilter] = useState('전체');
  const [reviewWriteLoading, setReviewWriteLoading] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState({ average: null, count: 0, distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } });
  const [loading, setLoading] = useState(!!productId);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState(null);
  const [orderItemId, setOrderItemId] = useState(null);
  const [modalError, setModalError] = useState('');
  const [form, setForm] = useState({ rating: 5, content: '', bodyType: '', petType: '', imageUrls: [] });
  const [formSaving, setFormSaving] = useState(false);
  const [formUploading, setFormUploading] = useState(false);

  const loadReviews = useCallback(() => {
    if (!productId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch(`/api/products/${productId}/reviews`)
      .then((r) => (r.ok ? r.json() : { reviews: [], summary: null }))
      .then((data) => {
        const list = data.reviews || [];
        setReviews(list);
        if (data.summary) {
          setSummary(data.summary);
        } else if (list.length > 0) {
          const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
          let sum = 0;
          list.forEach((r) => {
            const v = Math.min(5, Math.max(1, Number(r.rating) || 0));
            dist[v] = (dist[v] || 0) + 1;
            sum += v;
          });
          setSummary({
            average: Math.round((sum / list.length) * 10) / 10,
            count: list.length,
            distribution: dist,
          });
        }
      })
      .catch(() => {
        setReviews([]);
        setSummary({ average: null, count: 0, distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } });
      })
      .finally(() => setLoading(false));
  }, [productId]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const filteredReviews =
    bodyFilter === '전체'
      ? reviews
      : reviews.filter((r) => (r.bodyType || '').trim() === bodyFilter);

  async function handleReviewWriteClick() {
    const token = typeof window !== 'undefined' ? localStorage.getItem(USER_TOKEN_KEY) : null;
    if (!token) {
      setModalError('상품후기는 로그인하신 뒤 작성할 수 있습니다.');
      setModalMode('error');
      setModalOpen(true);
      return;
    }
    if (!productId) {
      setModalError('상품 정보가 없습니다.');
      setModalMode('error');
      setModalOpen(true);
      return;
    }
    setReviewWriteLoading(true);
    setModalError('');
    try {
      const res = await fetch(`/api/user/can-review?productId=${encodeURIComponent(productId)}`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include',
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 401) {
        setModalError('상품후기는 로그인하신 뒤 작성할 수 있습니다.');
        setModalMode('error');
        setModalOpen(true);
        return;
      }
      if (!data.canReview) {
        setModalError(data.error || '구매하지 않은 상품이거나, 구매 후 6개월이 지났거나, 이미 리뷰를 작성한 상품입니다. 결제 완료된 주문에 대해서만 리뷰를 작성할 수 있습니다.');
        setModalMode('error');
        setModalOpen(true);
        return;
      }
      setOrderItemId(data.orderItemId || null);
      setForm({ rating: 5, content: '', bodyType: '', petType: '', imageUrls: [] });
      setModalMode('form');
      setModalOpen(true);
    } finally {
      setReviewWriteLoading(false);
    }
  }

  async function handleModalImageChange(e) {
    const files = e.target.files;
    if (!files?.length) return;
    const token = typeof window !== 'undefined' ? localStorage.getItem(USER_TOKEN_KEY) : null;
    if (!token) return;
    setFormUploading(true);
    try {
      const formData = new FormData();
      for (let i = 0; i < Math.min(files.length, 10 - form.imageUrls.length); i++) {
        formData.append('files', files[i]);
      }
      const res = await fetch('/api/user/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '업로드 실패');
      setForm((f) => ({ ...f, imageUrls: [...f.imageUrls, ...(data.urls || [])].slice(0, 10) }));
    } catch (err) {
      setModalError(err.message || '이미지 업로드에 실패했습니다.');
    }
    setFormUploading(false);
    e.target.value = '';
  }

  async function handleModalSubmit(e) {
    e.preventDefault();
    if (!orderItemId || !productId) return;
    const token = typeof window !== 'undefined' ? localStorage.getItem(USER_TOKEN_KEY) : null;
    if (!token) return;
    setModalError('');
    setFormSaving(true);
    try {
      const res = await fetch('/api/user/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        credentials: 'include',
        body: JSON.stringify({
          productId,
          orderItemId,
          rating: form.rating,
          content: form.content.trim(),
          bodyType: form.bodyType.trim() || undefined,
          petType: form.petType || undefined,
          imageUrls: form.imageUrls.length ? form.imageUrls : undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (data.error) throw new Error(data.error);
      setModalOpen(false);
      setModalMode(null);
      loadReviews();
    } catch (err) {
      setModalError(err?.message || '리뷰 등록에 실패했습니다.');
    } finally {
      setFormSaving(false);
    }
  }

  return (
    <section className="py-8 md:py-12" aria-labelledby="section-reviews-title">
      <h2 id="section-reviews-title" className="sr-only">
        상품 후기
      </h2>
      <div className="mx-auto max-w-[860px] px-4 md:px-6">
        {/* 이용자 평점 + 평점 비율 (VIP overview 스타일) */}
        <div className="mb-8">
          <VipOverviewBox summary={summary} />
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <span className="text-sm font-medium text-gray-700">리뷰 {summary.count}개</span>
          <button
            type="button"
            onClick={handleReviewWriteClick}
            disabled={reviewWriteLoading}
            className="ml-auto rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 disabled:opacity-60"
          >
            {reviewWriteLoading ? '확인 중…' : '리뷰 쓰기'}
          </button>
        </div>

        <h3 className="mt-6 text-xs font-medium uppercase tracking-wider text-gray-400">체형별 필터</h3>
        <div className="mt-2 flex flex-wrap gap-2">
          {BODY_TYPE_OPTIONS.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => setBodyFilter(opt)}
              className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                bodyFilter === opt
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="mt-8 text-center text-sm text-gray-500">리뷰를 불러오는 중…</p>
        ) : (
          <ul className="mt-8 space-y-6">
            {filteredReviews.length === 0 ? (
              <li className="rounded-lg border border-gray-100 bg-white p-8 text-center text-sm text-gray-500">
                {reviews.length === 0 ? '등록된 상품 후기가 없습니다.' : '선택한 체형에 해당하는 후기가 없습니다.'}
              </li>
            ) : (
              filteredReviews.map((r) => {
                const imgs = parseImageUrls(r.imageUrls);
                return (
                  <li key={r.id} className="rounded-lg border border-gray-100 bg-white p-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                      {imgs.length > 0 && (
                        <div className="flex shrink-0 gap-2">
                          {imgs.slice(0, 3).map((url, i) => (
                            <div
                              key={i}
                              className="h-24 w-24 overflow-hidden rounded border border-gray-100 bg-gray-50"
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={url} alt="" className="h-full w-full object-cover" />
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <StarRating rating={r.rating} />
                          <span className="text-sm font-medium text-gray-700">{r.rating}점</span>
                          {(r.bodyType || r.petType) && (
                            <span className="text-xs text-gray-500">
                              {r.petType === 'DOG' ? '강아지' : r.petType === 'CAT' ? '고양이' : ''}
                              {r.petType && r.bodyType ? ' · ' : ''}
                              {r.bodyType || ''}
                            </span>
                          )}
                        </div>
                        <p className="mt-2 text-sm text-gray-800 whitespace-pre-wrap">{r.content}</p>
                        <p className="mt-2 text-xs text-gray-400">
                          {r.writerName || '회원'} · {new Date(r.createdAt).toLocaleDateString('ko-KR')}
                        </p>
                      </div>
                    </div>
                  </li>
                );
              })
            )}
          </ul>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-labelledby="review-modal-title">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white shadow-xl">
            <div className="sticky top-0 flex items-center justify-between border-b bg-white px-4 py-3">
              <h2 id="review-modal-title" className="text-lg font-semibold">
                {modalMode === 'form' ? '리뷰 작성' : '안내'}
              </h2>
              <button type="button" onClick={() => { setModalOpen(false); setModalMode(null); setModalError(''); }} className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700" aria-label="닫기">
                ✕
              </button>
            </div>
            <div className="p-4">
              {modalMode === 'error' && (
                <p className="text-gray-700">{modalError}</p>
              )}
              {modalMode === 'form' && (
                <form onSubmit={handleModalSubmit} className="space-y-4">
                  {modalError && <div className="rounded-md bg-red-50 p-3 text-sm text-red-700" role="alert">{modalError}</div>}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">별점 (1~5) *</label>
                    <select value={form.rating} onChange={(e) => setForm((f) => ({ ...f, rating: Number(e.target.value) }))} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" required>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <option key={n} value={n}>{n}점 {'★'.repeat(n)}{'☆'.repeat(5 - n)}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">반려동물 종 *</label>
                    <select value={form.petType} onChange={(e) => setForm((f) => ({ ...f, petType: e.target.value }))} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2">
                      <option value="">선택</option>
                      <option value="DOG">강아지</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">체형</label>
                    <input type="text" value={form.bodyType} onChange={(e) => setForm((f) => ({ ...f, bodyType: e.target.value }))} placeholder="예: 소형, 중형, 대형" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">내용 *</label>
                    <textarea value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))} rows={4} required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" placeholder="상품에 대한 리뷰를 작성해 주세요." />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">사진 (최대 10장)</label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {form.imageUrls.map((url, i) => (
                        <div key={i} className="relative">
                          <img src={url} alt="" className="h-20 w-20 rounded-md border object-cover" />
                          <button type="button" onClick={() => setForm((f) => ({ ...f, imageUrls: f.imageUrls.filter((_, idx) => idx !== i) }))} className="absolute -right-1 -top-1 rounded-full bg-red-500 px-1.5 py-0.5 text-xs text-white hover:bg-red-600">삭제</button>
                        </div>
                      ))}
                      {form.imageUrls.length < 10 && (
                        <label className="flex h-20 w-20 cursor-pointer items-center justify-center rounded-md border-2 border-dashed border-gray-300 text-xs text-gray-500 hover:border-gray-400">
                          <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple className="hidden" disabled={formUploading} onChange={handleModalImageChange} />
                          {formUploading ? '업로드 중…' : '+ 사진'}
                        </label>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" disabled={formSaving} className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50">
                      {formSaving ? '등록 중…' : '리뷰 등록'}
                    </button>
                    <button type="button" onClick={() => { setModalOpen(false); setModalMode(null); setModalError(''); }} className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">취소</button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
