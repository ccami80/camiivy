'use client';

import Link from 'next/link';
import DisplayToggleSwitch from './DisplayToggleSwitch';
import DisplayOrderInput from './DisplayOrderInput';

function formatPrice(price) {
  return new Intl.NumberFormat('ko-KR').format(price) + '원';
}

export default function ProductDisplayRow({
  product,
  selected,
  onToggleSelect,
  onDisplayChange,
  onOrderChange,
}) {
  const {
    id,
    name,
    price,
    brandName,
    thumbnailUrl,
    isDisplayed,
    displayOrder,
    approvedAt,
  } = product;

  return (
    <tr className="divide-x divide-gray-100">
      <td className="px-4 py-3.5">
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onToggleSelect(id)}
          className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-500"
        />
      </td>
      <td className="px-4 py-3.5">
        <div className="h-12 w-12 overflow-hidden rounded border border-gray-100 bg-gray-50">
          {thumbnailUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={thumbnailUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-xs text-gray-400">
              —
            </span>
          )}
        </div>
      </td>
      <td className="max-w-[200px] px-4 py-3.5 text-sm font-medium text-gray-900">
        {name}
      </td>
      <td className="px-4 py-3.5 text-sm text-gray-600">{brandName}</td>
      <td className="px-4 py-3.5 text-sm text-gray-600">{formatPrice(price)}</td>
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-2">
          <DisplayToggleSwitch
            checked={isDisplayed}
            onChange={(v) => onDisplayChange(id, v)}
          />
          <span className="text-xs text-gray-500">
            {isDisplayed ? '노출' : '비노출'}
          </span>
        </div>
      </td>
      <td className="px-4 py-3.5">
        <DisplayOrderInput
          value={displayOrder ?? 0}
          onChange={(v) => onOrderChange(id, v)}
        />
      </td>
      <td className="px-4 py-3.5">
        <span className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
          승인완료
        </span>
      </td>
      <td className="px-4 py-3.5">
        <Link
          href={`/admin/products/display/${id}`}
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          수정
        </Link>
      </td>
    </tr>
  );
}
