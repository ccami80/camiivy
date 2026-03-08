'use client';

import StatusBadge from './StatusBadge';
import ApproveRejectButtons from './ApproveRejectButtons';

function formatPrice(price) {
  return new Intl.NumberFormat('ko-KR').format(price) + '원';
}

function ProductThumbnail({ src, alt }) {
  return (
    <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded border border-gray-100 bg-gray-50">
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover"
          width={48}
          height={48}
        />
      ) : (
        <span className="flex h-full w-full items-center justify-center text-xs text-gray-400">
          -
        </span>
      )}
    </div>
  );
}

export default function ProductApprovalTable({ products, onStatusChange }) {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-100 bg-white">
      <table className="min-w-full divide-y divide-gray-100">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              상품 이미지
            </th>
            <th className="px-4 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              상품명
            </th>
            <th className="px-4 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              브랜드(입점업체명)
            </th>
            <th className="px-4 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              카테고리
            </th>
            <th className="px-4 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              판매가
            </th>
            <th className="px-4 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              등록일
            </th>
            <th className="px-4 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              상태
            </th>
            <th className="px-4 py-3.5 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
              작업
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {products.length === 0 ? (
            <tr>
              <td
                colSpan={8}
                className="px-4 py-8 text-center text-sm text-gray-500"
              >
                승인 대기 상품이 없습니다.
              </td>
            </tr>
          ) : (
            products.map((row) => (
              <tr key={row.id}>
                <td className="px-4 py-3.5">
                  <ProductThumbnail src={row.image} alt={row.name} />
                </td>
                <td className="max-w-[200px] px-4 py-3.5 font-medium text-gray-900">
                  {row.name}
                </td>
                <td className="px-4 py-3.5 text-sm text-gray-600">
                  {row.brand}
                </td>
                <td className="px-4 py-3.5 text-sm text-gray-600">
                  {row.category}
                </td>
                <td className="px-4 py-3.5 text-sm text-gray-600">
                  {formatPrice(row.price)}
                </td>
                <td className="px-4 py-3.5 text-sm text-gray-600">
                  {row.createdAt}
                </td>
                <td className="px-4 py-3.5">
                  <StatusBadge status={row.status} />
                </td>
                <td className="px-4 py-3.5 text-right">
                  <ApproveRejectButtons
                    status={row.status}
                    onApprove={() => onStatusChange(row.id, 'APPROVED')}
                    onReject={() => onStatusChange(row.id, 'REJECTED')}
                  />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
