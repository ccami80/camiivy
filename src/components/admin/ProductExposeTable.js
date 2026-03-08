'use client';

function formatPrice(price) {
  return new Intl.NumberFormat('ko-KR').format(price) + '원';
}

export default function ProductExposeTable({
  products,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  onExposeChange,
  onMainExposeChange,
}) {
  const allSelected = products.length > 0 && products.every((p) => selectedIds.has(p.id));

  return (
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
            카테고리
          </th>
          <th className="px-4 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
            가격
          </th>
          <th className="px-4 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
            승인 상태
          </th>
          <th className="px-4 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
            노출 상태
          </th>
          <th className="px-4 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
            메인 노출
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100 bg-white">
        {products.length === 0 ? (
          <tr>
            <td colSpan={9} className="px-4 py-8 text-center text-sm text-gray-500">
              조건에 맞는 상품이 없습니다.
            </td>
          </tr>
        ) : (
          products.map((p) => (
            <tr key={p.id}>
              <td className="px-4 py-3.5">
                <input
                  type="checkbox"
                  checked={selectedIds.has(p.id)}
                  onChange={() => onToggleSelect(p.id)}
                  className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-500"
                />
              </td>
              <td className="px-4 py-3.5">
                <div className="h-12 w-12 overflow-hidden rounded border border-gray-100 bg-gray-50">
                  {p.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.image} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-xs text-gray-400">-</span>
                  )}
                </div>
              </td>
              <td className="max-w-[180px] px-4 py-3.5 text-sm font-medium text-gray-900">
                {p.name}
              </td>
              <td className="px-4 py-3.5 text-sm text-gray-600">{p.sellerName}</td>
              <td className="px-4 py-3.5 text-sm text-gray-600">{p.category}</td>
              <td className="px-4 py-3.5 text-sm text-gray-600">{formatPrice(p.price)}</td>
              <td className="px-4 py-3.5">
                <span className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                  승인 완료
                </span>
              </td>
              <td className="px-4 py-3.5">
                <button
                  type="button"
                  role="switch"
                  aria-checked={p.isExposed}
                  onClick={() => onExposeChange(p.id, !p.isExposed)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 ${
                    p.isExposed ? 'bg-gray-800' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition ${
                      p.isExposed ? 'translate-x-5' : 'translate-x-1'
                    }`}
                  />
                </button>
                <span className="ml-1 text-xs text-gray-500">
                  {p.isExposed ? '노출' : '비노출'}
                </span>
              </td>
              <td className="px-4 py-3.5">
                <input
                  type="checkbox"
                  checked={p.isMainExposed}
                  onChange={(e) => onMainExposeChange(p.id, e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-500"
                />
                <span className="ml-1 text-xs text-gray-500">메인</span>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}
