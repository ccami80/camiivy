'use client';

import { useState } from 'react';

export default function ProductGallery({ images }) {
  const list = Array.isArray(images) && images.length > 0 ? images : [null];
  const [selectedIndex, setSelectedIndex] = useState(0);
  const main = list[selectedIndex];

  return (
    <div className="space-y-4">
      <div className="aspect-square w-full overflow-hidden rounded-lg border border-gray-100 bg-gray-50">
        {main ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={typeof main === 'string' ? main : main?.url}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-gray-400">
            상품 이미지
          </div>
        )}
      </div>
      {list.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-1">
          {list.map((img, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setSelectedIndex(i)}
              className={`h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border transition-colors ${
                selectedIndex === i ? 'border-gray-700' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {img ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={typeof img === 'string' ? img : img?.url}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gray-100 text-gray-400 text-xs">
                  —
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
