'use client';

/**
 * Generic filter bar: one dropdown (options + value + onChange) + one search input.
 * Reusable for list pages.
 */
export default function AdminFilterBar({
  dropdownLabel = '필터',
  dropdownOptions = [],
  dropdownValue = '',
  onDropdownChange,
  searchPlaceholder = '검색…',
  searchValue = '',
  onSearchChange,
}) {
  return (
    <div className="flex flex-wrap items-center gap-6 rounded-lg border border-gray-100 bg-white p-5">
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">{dropdownLabel}</span>
        <select
          value={dropdownValue}
          onChange={(e) => onDropdownChange?.(e.target.value)}
          className="rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
        >
          {dropdownOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="search"
          value={searchValue}
          onChange={(e) => onSearchChange?.(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-56 rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
        />
      </div>
    </div>
  );
}
