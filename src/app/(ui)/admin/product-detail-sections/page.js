'use client';

import Link from 'next/link';

/**
 * 상품 상세 페이지 하단 섹션 관리 허브.
 * - 카테고리별 베스트: 상세 페이지에서 해당 상품의 카테고리와 일치하는 베스트 상품 노출
 * - 함께 구매하면 좋은 상품: 상품별로 추천 상품 직접 설정
 */
export default function AdminProductDetailSectionsPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">상품 상세 하단 관리</h1>
      <p className="mt-1 text-sm text-gray-500">
        상품 상세 페이지 하단의 「카테고리별 베스트 상품」「함께 구매하면 좋은 상품이에요」 섹션을 설정합니다.
      </p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <Link
          href="/admin/category-best"
          className="block rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:border-gray-300 hover:shadow-md"
        >
          <h2 className="text-lg font-semibold text-gray-900">카테고리별 베스트 상품</h2>
          <p className="mt-2 text-sm text-gray-600">
            상품 상세 페이지의 「카테고리별 베스트 상품」에는 <strong>해당 상품의 카테고리</strong>와 일치하는 상품만 노출됩니다. 카테고리별로 베스트 상품을 추가·순서 변경·제거할 수 있습니다. 설정이 없으면 해당 카테고리의 승인 상품을 노출 순서대로 노출합니다.
          </p>
          <span className="mt-4 inline-flex items-center text-sm font-medium text-gray-900">
            카테고리별 베스트 설정
            <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </Link>

        <Link
          href="/admin/recommended"
          className="block rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:border-gray-300 hover:shadow-md"
        >
          <h2 className="text-lg font-semibold text-gray-900">함께 구매하면 좋은 상품</h2>
          <p className="mt-2 text-sm text-gray-600">
            상품 상세 페이지의 「함께 구매하면 좋은 상품이에요」에 노출할 상품을 <strong>상품별로</strong> 설정합니다. 대상 상품을 선택한 뒤 추천 상품을 추가·순서 변경·제거할 수 있습니다. 설정이 없으면 같은 카테고리·브랜드 등 자동 추천으로 노출됩니다.
          </p>
          <span className="mt-4 inline-flex items-center text-sm font-medium text-gray-900">
            함께 구매 추천 설정
            <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </Link>
      </div>
    </div>
  );
}
