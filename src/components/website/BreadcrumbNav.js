import Link from 'next/link';

/**
 * 공통 브레드크럼 (HOME > 현재 페이지)
 * 모든 페이지에서 동일한 위치·스타일을 위해 사용. 상단 패딩은 부모에서 breadcrumb 영역에 pt-8 pb-6 적용.
 */
export default function BreadcrumbNav({ label }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex items-center gap-1 text-sm">
        <li>
          <Link href="/" className="text-gray-400 hover:text-gray-600">
            HOME
          </Link>
        </li>
        <li className="text-gray-400" aria-hidden> &gt; </li>
        <li>
          <span className="font-semibold text-gray-900 underline underline-offset-2">
            {label}
          </span>
        </li>
      </ol>
    </nav>
  );
}

/** 브레드크럼만 있는 페이지용 블록 (동일 위치: mx-auto max-w-6xl px-4 pt-8 pb-6) */
export function BreadcrumbBlock({ label, children }) {
  return (
    <div className="mx-auto max-w-6xl px-4 pt-8 pb-6">
      <BreadcrumbNav label={label} />
      {children}
    </div>
  );
}
