import BreadcrumbNav from './BreadcrumbNav';

/**
 * 카테고리 페이지 상단: 브레드크럼 + 대제목 + 부제목 (브레드크럼 위치 통일)
 */
export default function CategoryPageTitle({ breadcrumbLabel, title, subtitle }) {
  return (
    <div className="mx-auto max-w-6xl px-0 pt-8 pb-6">
      <BreadcrumbNav label={breadcrumbLabel} />
      <h1 className="text-center text-3xl font-bold uppercase tracking-tight text-gray-900 md:text-4xl">
        {title}
      </h1>
      <p className="mt-2 text-center text-sm text-gray-600">
        {subtitle}
      </p>
    </div>
  );
}
