'use client';

import { useState } from 'react';

const BODY_TYPES = ['소형견', '중형견', '대형견', '소형고양이', '중형고양이'];

export default function ReviewForm({ productName, onSubmit }) {
  const [rating, setRating] = useState(0);
  const [text, setText] = useState('');
  const [bodyType, setBodyType] = useState('');
  const [photoPreview, setPhotoPreview] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoPreview(URL.createObjectURL(file));
    e.target.value = '';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.({ rating, text, bodyType, hasPhoto: !!photoPreview });
    setRating(0);
    setText('');
    setBodyType('');
    setPhotoPreview(null);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-lg border border-gray-100 bg-white p-6">
      {productName && (
        <p className="text-sm text-gray-600">상품: {productName}</p>
      )}
      <div>
        <p className="text-sm text-gray-600">별점</p>
        <div className="mt-2 flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className="text-2xl leading-none text-gray-300 hover:text-gray-500 focus:outline-none"
              aria-label={`${star}점`}
            >
              <span className={rating >= star ? 'text-gray-600' : ''}>★</span>
            </button>
          ))}
        </div>
      </div>
      <div>
        <label htmlFor="review-text" className="block text-sm text-gray-600">
          리뷰 내용
        </label>
        <textarea
          id="review-text"
          rows={3}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="구매 후기를 남겨 주세요."
          className="mt-1.5 block w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
        />
      </div>
      <div>
        <label className="block text-sm text-gray-600">반려동물 체형</label>
        <select
          value={bodyType}
          onChange={(e) => setBodyType(e.target.value)}
          className="mt-1.5 block w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
        >
          <option value="">선택</option>
          {BODY_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>
      <div>
        {/* TODO: 사진 업로드 API 미연동. 선택 시 미리보기만 표시 */}
        <label className="block text-sm text-gray-600">사진 (mock)</label>
        <div className="mt-1.5 flex items-center gap-3">
          <label className="cursor-pointer rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50">
            <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            사진 추가
          </label>
          {photoPreview && (
            <div className="relative h-14 w-14 overflow-hidden rounded border border-gray-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photoPreview} alt="" className="h-full w-full object-cover" />
            </div>
          )}
        </div>
      </div>
      <button
        type="submit"
        className="rounded-md border border-gray-800 bg-gray-800 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-700"
      >
        리뷰 등록
      </button>
    </form>
  );
}
