'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

const USER_TOKEN_KEY = 'userToken';

function WriteReviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get('productId');
  const orderItemId = searchParams.get('orderItemId') || '';
  const [product, setProduct] = useState(null);
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState('');
  const [bodyType, setBodyType] = useState('');
  const [petType, setPetType] = useState('');
  const [imageUrls, setImageUrls] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(!!productId);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function getToken() {
    return typeof window !== 'undefined' ? localStorage.getItem(USER_TOKEN_KEY) : null;
  }

  useEffect(() => {
    if (!productId) {
      setLoading(false);
      return;
    }
    fetch(`/api/products/${productId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then(setProduct)
      .finally(() => setLoading(false));
  }, [productId]);

  async function handleImageChange(e) {
    const files = e.target.files;
    if (!files?.length) return;
    const token = getToken();
    if (!token) return;
    setUploading(true);
    setError('');
    try {
      const formData = new FormData();
      for (let i = 0; i < Math.min(files.length, 10 - imageUrls.length); i++) {
        formData.append('files', files[i]);
      }
      const res = await fetch('/api/user/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '업로드 실패');
      setImageUrls((prev) => [...prev, ...(data.urls || [])].slice(0, 10));
    } catch (err) {
      setError(err.message || '이미지 업로드에 실패했습니다.');
    }
    setUploading(false);
    e.target.value = '';
  }

  function removeImage(idx) {
    setImageUrls((prev) => prev.filter((_, i) => i !== idx));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!orderItemId) {
      setError('구매 완료한 주문에서만 리뷰 작성이 가능합니다. 주문 내역에서 해당 상품의 「리뷰 작성」으로 들어와 주세요.');
      return;
    }
    setError('');
    setSaving(true);
    const token = getToken();
    if (!token) {
      setError('로그인이 필요합니다.');
      setSaving(false);
      return;
    }
    fetch('/api/user/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        productId,
        orderItemId,
        rating,
        content: content.trim(),
        bodyType: bodyType.trim() || undefined,
        petType: petType || undefined,
        imageUrls: imageUrls.length ? imageUrls : undefined,
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        router.push('/my/reviews');
        router.refresh();
      })
      .catch((err) => setError(err.message))
      .finally(() => setSaving(false));
  }

  if (!productId) {
    return (
      <div>
        <p className="text-gray-500">상품 정보가 없습니다.</p>
        <Link href="/my/reviews" className="mt-4 inline-block text-sm font-medium text-gray-700 underline">리뷰 목록</Link>
      </div>
    );
  }

  if (loading) return <p className="text-gray-500">로딩 중…</p>;
  if (!product) return <p className="text-gray-500">상품을 찾을 수 없습니다.</p>;

  if (!orderItemId) {
    return (
      <div>
        <Link href="/my/reviews" className="text-sm font-medium text-gray-600 hover:underline">← 리뷰 목록</Link>
        <h1 className="mt-4 text-2xl font-semibold text-gray-900">리뷰 작성</h1>
        <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-800">
          <p className="font-medium">구매 완료한 사용자만 리뷰를 작성할 수 있습니다.</p>
          <p className="mt-2 text-sm">주문 내역 → 결제 완료된 주문 상세에서 해당 상품의 「리뷰 작성」 버튼을 눌러 주세요.</p>
        </div>
        <Link href="/my/orders" className="mt-4 inline-block text-sm font-medium text-gray-700 underline">주문 내역으로</Link>
      </div>
    );
  }

  return (
    <div>
      <Link href="/my/reviews" className="text-sm font-medium text-gray-600 hover:underline">← 리뷰 목록</Link>
      <h1 className="mt-4 text-2xl font-semibold text-gray-900">리뷰 작성</h1>
      <p className="mt-1 text-gray-600">상품: {product.name}</p>
      <form onSubmit={handleSubmit} className="mt-6 max-w-md space-y-4">
        {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-700" role="alert">{error}</div>}
        <div>
          <label className="block text-sm font-medium text-gray-700">별점 (1~5) *</label>
          <select value={rating} onChange={(e) => setRating(Number(e.target.value))} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" required>
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>{n}점 {'★'.repeat(n)}{'☆'.repeat(5 - n)}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">반려동물 종 *</label>
          <select value={petType} onChange={(e) => setPetType(e.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2">
            <option value="">선택</option>
            <option value="DOG">강아지</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">체형</label>
          <input type="text" value={bodyType} onChange={(e) => setBodyType(e.target.value)} placeholder="예: 소형, 중형, 대형" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">내용 *</label>
          <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={4} required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" placeholder="상품에 대한 리뷰를 작성해 주세요." />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">사진 (최대 10장)</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {imageUrls.map((url, i) => (
              <div key={i} className="relative">
                <img src={url} alt="" className="h-20 w-20 rounded-md border object-cover" />
                <button type="button" onClick={() => removeImage(i)} className="absolute -right-1 -top-1 rounded-full bg-red-500 px-1.5 py-0.5 text-xs text-white hover:bg-red-600">삭제</button>
              </div>
            ))}
            {imageUrls.length < 10 && (
              <label className="flex h-20 w-20 cursor-pointer items-center justify-center rounded-md border-2 border-dashed border-gray-300 text-xs text-gray-500 hover:border-gray-400">
                <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple className="hidden" disabled={uploading} onChange={handleImageChange} />
                {uploading ? '업로드 중…' : '+ 사진'}
              </label>
            )}
          </div>
        </div>
        <button type="submit" disabled={saving} className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50">
          {saving ? '등록 중…' : '리뷰 등록'}
        </button>
      </form>
    </div>
  );
}

export default function WriteReviewPage() {
  return (
    <Suspense fallback={<div className="p-6">로딩 중…</div>}>
      <WriteReviewContent />
    </Suspense>
  );
}
