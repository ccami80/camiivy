'use client';

/**
 * 상품 노출 관리 리스트용 필터 영역
 * - 상태: 전체 / 노출중 / 노출중지
 * - 카테고리
 * - 검색: 상품명 / 입점업체명
 */
export default function FilterBar({
  statusFilter,
  categoryFilter,
  searchQuery,
  categories = [],
  onStatusChange,
  onCategoryChange,
  onSearchChange,
}) {
  return (
    <div className="flex flex-wrap items-center gap-6 rounded-lg border border-gray-100 bg-white p-5">
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">상태</span>
        <select
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
          className="rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
        >
          <option value="">전체</option>
          <option value="displayed">노출중</option>
          <option value="hidden">노출중지</option>
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
        <span className="text-sm text-gray-600">검색</span>
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="상품명 / 입점업체명"
          className="w-56 rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
        />
      </div>
    </div>
  );
}
