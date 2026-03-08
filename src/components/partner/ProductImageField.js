'use client';

import { useState } from 'react';

function reorder(list, fromIndex, toIndex) {
  if (fromIndex === toIndex) return list;
  const arr = [...list];
  const [removed] = arr.splice(fromIndex, 1);
  arr.splice(toIndex, 0, removed);
  return arr;
}

const DEFAULT_MAX = 999;

export default function ProductImageField({
  urls = [],
  setUrls,
  onUpload,
  uploading = false,
  type = 'main',
  title = '상품 이미지',
  description = '리스트·상세 갤러리용. 여러 장 한꺼번에 선택 가능. 첫 번째가 대표 이미지입니다.',
  thumbSize = 'h-20 w-20',
  maxCount = DEFAULT_MAX,
}) {
  const atLimit = maxCount !== DEFAULT_MAX && urls.length >= maxCount;
  const [draggedIndex, setDraggedIndex] = useState(null);

  function handleDragStart(e, index) {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));
    e.dataTransfer.setData('application/json', JSON.stringify({ index, type }));
  }

  function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }

  function handleDragEnd() {
    setDraggedIndex(null);
  }

  function handleDrop(e, dropIndex) {
    e.preventDefault();
    setDraggedIndex(null);
    const raw = e.dataTransfer.getData('text/plain');
    const dragIndex = raw === '' ? undefined : parseInt(raw, 10);
    if (dragIndex == null || Number.isNaN(dragIndex) || dragIndex === dropIndex) return;
    setUrls((prev) => reorder(prev, dragIndex, dropIndex));
  }

  function setAsMain(index) {
    if (index === 0) return;
    setUrls((prev) => reorder(prev, index, 0));
  }

  function remove(url) {
    setUrls((prev) => prev.filter((u) => u !== url));
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-4">
      <p className="text-sm font-medium text-gray-700">{title}</p>
      <p className="mt-0.5 text-xs text-gray-500">{description}</p>
      <div className="mt-3 flex flex-wrap items-start gap-3">
        {urls.map((url, index) => (
          <div
            key={url}
            data-index={index}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
            onDrop={(e) => handleDrop(e, index)}
            className={`relative flex flex-col items-center ${draggedIndex === index ? 'opacity-50' : ''}`}
          >
            <div
              className={`${thumbSize} overflow-hidden rounded-md border-2 border-gray-200 bg-white object-cover transition-colors ${
                index === 0 ? 'border-amber-400 ring-2 ring-amber-200' : 'border-gray-200'
              } cursor-grab active:cursor-grabbing`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="h-full w-full object-cover" draggable={false} />
            </div>
            <div className="mt-1 flex items-center gap-1">
              {index === 0 && (
                <span className="rounded bg-amber-100 px-1.5 py-0.5 text-xs font-medium text-amber-800">대표</span>
              )}
              {index !== 0 && (
                <button
                  type="button"
                  onClick={() => setAsMain(index)}
                  className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600 hover:bg-gray-200"
                >
                  대표로
                </button>
              )}
              <button
                type="button"
                onClick={() => remove(url)}
                className="rounded bg-red-100 px-1.5 py-0.5 text-xs text-red-600 hover:bg-red-200"
              >
                삭제
              </button>
            </div>
          </div>
        ))}
        {!atLimit && (
          <label
            className={`flex ${thumbSize} cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-gray-300 text-xs text-gray-500 hover:border-gray-400 hover:bg-white ${uploading ? 'pointer-events-none opacity-60' : ''}`}
          >
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              multiple
              className="hidden"
              disabled={uploading}
              onChange={(e) => {
                const files = e.target.files;
                if (files?.length) onUpload(Array.from(files), type);
                e.target.value = '';
              }}
            />
            {uploading ? '업로드 중…' : (maxCount !== DEFAULT_MAX ? `+ 추가 (최대 ${maxCount}장)` : '+ 여러 장 추가')}
          </label>
        )}
        {atLimit && (
          <span className={`flex ${thumbSize} items-center justify-center text-xs text-gray-500`}>최대 {maxCount}장</span>
        )}
      </div>
    </div>
  );
}
