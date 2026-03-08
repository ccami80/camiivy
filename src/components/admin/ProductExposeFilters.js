'use client';

export default function ProductExposeFilters({
  brandFilter,
  categoryFilter,
  exposureFilter,
  categories,
  onBrandChange,
  onCategoryChange,
  onExposureChange,
}) {
  return (
    <div className="flex flex-wrap items-center gap-6 rounded-lg border border-gray-100 bg-white p-5">
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">브랜드</span>
        <select
          value={brandFilter}
          onChange={(e) => onBrandChange(e.target.value)}
          className="rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
        >
          <option value="">전체</option>
          <option value="CAMI">까미</option>
          <option value="IVY">아이비</option>
        </select>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">카테고리</span>
        <select
          value={categoryFilter}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
        >
          <option value="">전체</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">노출 상태</span>
        <select
          value={exposureFilter}
          onChange={(e) => onExposureChange(e.target.value)}
          className="rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
        >
          <option value="">전체</option>
          <option value="exposed">노출중</option>
          <option value="hidden">비노출</option>
        </select>
      </div>
    </div>
  );
}
