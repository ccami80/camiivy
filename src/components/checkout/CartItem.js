'use client';

import Link from 'next/link';

function formatPrice(n) {
  return new Intl.NumberFormat('ko-KR').format(n) + '원';
}

export default function CartItem({
  item,
  checked,
  onToggle,
  onQtyChange,
  onRemove,
  disabled,
}) {
  const lineTotal = (item.price || 0) * (item.quantity || 1);

  return (
    <li className="flex gap-4 rounded-lg border border-gray-100 bg-white p-4">
      <div className="flex shrink-0 items-start pt-0.5">
        <input
          type="checkbox"
          checked={checked}
          onChange={() => onToggle(item.id)}
          disabled={disabled}
          className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-500"
        />
      </div>
      <Link href={`/products/${item.productId}`} className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md border border-gray-100 bg-gray-50">
        {item.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.image} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-xs text-gray-400">이미지</span>
        )}
      </Link>
      <div className="min-w-0 flex-1">
        <Link href={`/products/${item.productId}`} className="font-medium text-gray-900 hover:underline">
          {item.name}
        </Link>
        {item.option && (
          <p className="mt-0.5 text-sm text-gray-500">옵션: {item.option}</p>
        )}
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onQtyChange(item.id, Math.max(1, item.quantity - 1))}
              disabled={disabled || item.quantity <= 1}
              className="h-8 w-8 rounded border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
            >
              −
            </button>
            <span className="w-10 text-center text-sm">{item.quantity}</span>
            <button
              type="button"
              onClick={() => onQtyChange(item.id, item.quantity + 1)}
              disabled={disabled}
              className="h-8 w-8 rounded border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
            >
              +
            </button>
          </div>
          <span className="text-sm font-semibold text-gray-800">{formatPrice(lineTotal)}</span>
        </div>
      </div>
      <div className="shrink-0">
        <button
          type="button"
          onClick={() => onRemove(item.id)}
          disabled={disabled}
          className="text-sm text-gray-500 hover:text-red-600 disabled:opacity-50"
        >
          삭제
        </button>
      </div>
    </li>
  );
}
