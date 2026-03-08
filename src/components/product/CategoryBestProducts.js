'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const PER_PAGE = 5;

function formatPrice(price) {
  return new Intl.NumberFormat('ko-KR').format(price) + '원';
}

export default function CategoryBestProducts({ productId }) {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(!!productId);
  const [page, setPage] = useState(0);

  useEffect(() => {
    if (!productId) {
      setLoading(false);
      return;
    }
    fetch(`/api/products/${productId}/category-best`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        setList(Array.isArray(data) ? data : []);
        setPage(0);
      })
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  }, [productId]);

  const totalPages = Math.max(1, Math.ceil(list.length / PER_PAGE));
  const currentPage = list.length > 0 ? Math.min(page, totalPages - 1) : 0;
  const pageList = list.slice(currentPage * PER_PAGE, currentPage * PER_PAGE + PER_PAGE);

  return (
    <section className="mt-20 border-t border-gray-200 pt-10 md:mt-24 md:pt-12" aria-label="카테고리별 베스트 상품">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">카테고리별 베스트 상품</h2>
        {list.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={currentPage === 0}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:pointer-events-none"
              aria-label="이전 페이지"
            >
              ‹
            </button>
            <span className="min-w-[4rem] text-center text-sm text-gray-600">
              <span className="font-medium text-blue-600">{currentPage + 1}</span>
              <span className="text-gray-400"> / {totalPages}</span>
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={currentPage >= totalPages - 1}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:pointer-events-none"
              aria-label="다음 페이지"
            >
              ›
            </button>
          </div>
        )}
      </div>
      {loading ? (
        <p className="mt-4 text-sm text-gray-500">로딩 중…</p>
      ) : list.length === 0 ? (
        <p className="mt-4 text-sm text-gray-500">이 카테고리의 다른 상품이 없습니다.</p>
      ) : (
        <ul className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {pageList.map((p) => {
            const imgUrl = p.images?.[0]?.url;
            const shippingText =
              p.shippingFee != null && Number(p.shippingFee) > 0
                ? `배송비 ${Number(p.shippingFee).toLocaleString()}원`
                : '무료배송';
            return (
              <li key={p.id}>
                <Link
                  href={`/products/${p.id}`}
                  className="block rounded-lg border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="h-36 w-full shrink-0 overflow-hidden rounded-t-lg bg-gray-50">
                    {imgUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={imgUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-gray-400">이미지 없음</div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="line-clamp-2 min-h-[2.5rem] text-sm font-medium leading-tight text-gray-900" title={p.name}>
                      {p.name}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-gray-900">{formatPrice(p.basePrice ?? 0)}</p>
                    <p className="mt-0.5 text-xs text-gray-500">{shippingText}</p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
