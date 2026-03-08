'use client';

/**
 * Pagination UI only (no logic). Callbacks for prev/next/page click.
 * Props: currentPage, totalPages, onPrev, onNext, onPageClick (optional).
 */
export default function Pagination({
  currentPage = 1,
  totalPages = 1,
  onPrev,
  onNext,
  onPageClick,
}) {
  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;
  const pages = Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
    let p;
    if (totalPages <= 5) p = i + 1;
    else if (currentPage <= 3) p = i + 1;
    else if (currentPage >= totalPages - 2) p = totalPages - 4 + i;
    else p = currentPage - 2 + i;
    return p;
  }).filter((p) => p >= 1 && p <= totalPages);

  return (
    <div className="flex items-center justify-center gap-2 py-4">
      <button
        type="button"
        onClick={onPrev}
        disabled={!hasPrev}
        className="rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        이전
      </button>
      <div className="flex gap-1">
        {pages.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onPageClick?.(p)}
            className={`h-8 w-8 rounded-md text-sm ${
              p === currentPage
                ? 'bg-gray-800 text-white'
                : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            {p}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={onNext}
        disabled={!hasNext}
        className="rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        다음
      </button>
    </div>
  );
}
