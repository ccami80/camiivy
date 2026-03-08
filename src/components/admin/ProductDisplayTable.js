'use client';

import ProductDisplayRow from './ProductDisplayRow';

export default function ProductDisplayTable({
  products,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  onDisplayChange,
  onOrderChange,
  onSave,
  hasChanges,
  isSaving = false,
}) {
  const allSelected =
    products.length > 0 && products.every((p) => selectedIds.has(p.id));

  return (
    <div className="rounded-lg border border-gray-100 bg-white">
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3.5">
        <span className="text-sm text-gray-600">승인 완료 상품 목록</span>
        <button
          type="button"
          onClick={onSave}
          disabled={!hasChanges || isSaving}
          className="rounded-md border border-gray-800 bg-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSaving ? '저장 중…' : '저장'}
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3.5 text-left">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={onSelectAll}
                  className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-500"
                />
              </th>
              <th className="px-4 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                상품 이미지
              </th>
              <th className="px-4 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                상품명
              </th>
              <th className="px-4 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                입점업체명
              </th>
              <th className="px-4 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                판매가
              </th>
              <th className="px-4 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                노출 상태
              </th>
              <th className="px-4 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                정렬 순서
              </th>
              <th className="px-4 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                승인 상태
              </th>
              <th className="px-4 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                수정
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {products.length === 0 ? (
              <tr>
                <td
                  colSpan={9}
                  className="px-4 py-10 text-center text-sm text-gray-500"
                >
                  조건에 맞는 상품이 없습니다.
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <ProductDisplayRow
                  key={product.id}
                  product={product}
                  selected={selectedIds.has(product.id)}
                  onToggleSelect={onToggleSelect}
                  onDisplayChange={onDisplayChange}
                  onOrderChange={onOrderChange}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
