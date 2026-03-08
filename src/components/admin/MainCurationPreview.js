'use client';

export default function MainCurationPreview({ brandLabel, products }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <h2 className="text-lg font-medium text-gray-800">
        [{brandLabel} 메인 노출 영역 미리보기]
      </h2>
      <p className="mt-0.5 text-xs text-gray-500">
        메인 노출에 체크된 상품이 이 영역에 표시됩니다.
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        {products.length === 0 ? (
          <p className="rounded-md bg-gray-50 px-3 py-4 text-center text-sm text-gray-500">
            노출 상품 없음
          </p>
        ) : (
          products.map((p) => (
            <div
              key={p.id}
              className="w-28 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 bg-gray-50"
            >
              <div className="aspect-square bg-gray-200">
                {p.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.image} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                    이미지 없음
                  </span>
                )}
              </div>
              <p className="truncate p-2 text-xs font-medium text-gray-800" title={p.name}>
                {p.name}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
