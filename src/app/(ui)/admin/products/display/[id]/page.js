'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import DisplayToggleSwitch from '@/components/admin/DisplayToggleSwitch';
import DisplayOrderInput from '@/components/admin/DisplayOrderInput';

const CATEGORIES = [
  '산책용품',
  '의류',
  '간식/식품',
  '캣타워/스크래쳐',
  '쿠션/방석',
  '놀이/장난감',
];

const MOCK_DISPLAY_DETAIL = {
  1: {
    id: 1,
    name: '프리미엄 강아지 하네스',
    price: 58000,
    brandName: '펫츠웨어',
    thumbnailUrl: '',
    isDisplayed: true,
    displayOrder: 1,
    isMainDisplay: true,
    categoryDisplays: { 산책용품: true, 의류: false, '간식/식품': false, '캣타워/스크래쳐': false, '쿠션/방석': false, '놀이/장난감': false },
  },
  2: {
    id: 2,
    name: '고양이 스크래쳐 캣타워',
    price: 89000,
    brandName: '멍냥샵',
    thumbnailUrl: '',
    isDisplayed: true,
    displayOrder: 2,
    isMainDisplay: true,
    categoryDisplays: { 산책용품: false, 의류: false, '간식/식품': false, '캣타워/스크래쳐': true, '쿠션/방석': false, '놀이/장난감': false },
  },
  3: {
    id: 3,
    name: '수제 강아지 간식 3종 세트',
    price: 22000,
    brandName: '강아지천국',
    thumbnailUrl: '',
    isDisplayed: false,
    displayOrder: 10,
    isMainDisplay: false,
    categoryDisplays: { 산책용품: false, 의류: false, '간식/식품': true, '캣타워/스크래쳐': false, '쿠션/방석': false, '놀이/장난감': false },
  },
  4: {
    id: 4,
    name: '강아지 방한 조끼',
    price: 35000,
    brandName: '펫츠웨어',
    thumbnailUrl: '',
    isDisplayed: true,
    displayOrder: 3,
    isMainDisplay: false,
    categoryDisplays: { 산책용품: false, 의류: true, '간식/식품': false, '캣타워/스크래쳐': false, '쿠션/방석': false, '놀이/장난감': false },
  },
  5: {
    id: 5,
    name: '캣닢 쿠션 방석',
    price: 42000,
    brandName: '멍냥샵',
    thumbnailUrl: '',
    isDisplayed: true,
    displayOrder: 4,
    isMainDisplay: true,
    categoryDisplays: { 산책용품: false, 의류: false, '간식/식품': false, '캣타워/스크래쳐': false, '쿠션/방석': true, '놀이/장난감': false },
  },
};

function getMockProduct(id) {
  const idNum = parseInt(id, 10);
  const found = MOCK_DISPLAY_DETAIL[idNum];
  if (found) {
    const categoryDisplays = CATEGORIES.reduce(
      (acc, c) => ({ ...acc, [c]: found.categoryDisplays?.[c] ?? false }),
      {}
    );
    return { ...found, categoryDisplays };
  }
  return {
    id: idNum,
    name: `상품 ${idNum}`,
    price: 0,
    brandName: '—',
    thumbnailUrl: '',
    isDisplayed: false,
    displayOrder: 99,
    isMainDisplay: false,
    categoryDisplays: CATEGORIES.reduce((acc, c) => ({ ...acc, [c]: false }), {}),
  };
}

function formatPrice(price) {
  return new Intl.NumberFormat('ko-KR').format(price) + '원';
}

export default function AdminProductsDisplayDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;
  const [product, setProduct] = useState(null);

  useEffect(() => {
    if (!id) return;
    setProduct(getMockProduct(id));
  }, [id]);

  const setDisplay = (isDisplayed) => {
    setProduct((p) => (p ? { ...p, isDisplayed } : p));
  };

  const setMainDisplay = (isMainDisplay) => {
    setProduct((p) => (p ? { ...p, isMainDisplay } : p));
  };

  const setOrder = (displayOrder) => {
    setProduct((p) => (p ? { ...p, displayOrder } : p));
  };

  const setCategoryDisplay = (category, value) => {
    setProduct((p) => (p ? { ...p, categoryDisplays: { ...p.categoryDisplays, [category]: value } } : p));
  };

  const handleSave = () => {
    console.log('[상품 노출 설정 저장]', product);
    router.push('/admin/products/display');
  };

  if (!product) {
    return (
      <div className="py-10 text-center text-sm text-gray-500">
        로딩 중…
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <Link
          href="/admin/products/display"
          className="text-sm text-gray-500 hover:text-gray-900"
        >
          ← 상품 노출 관리 목록
        </Link>
        <h1 className="mt-2 text-xl font-semibold text-gray-900">상품 노출 설정</h1>
      </div>

      <section className="rounded-lg border border-gray-100 bg-white p-5">
        <h2 className="text-xs font-medium uppercase tracking-wider text-gray-500">
          상품 기본 정보
        </h2>
        <div className="mt-4 flex gap-4">
          <div className="h-20 w-20 overflow-hidden rounded border border-gray-100 bg-gray-50">
            {product.thumbnailUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={product.thumbnailUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-xs text-gray-400">—</span>
            )}
          </div>
          <div>
            <p className="font-medium text-gray-900">{product.name}</p>
            <p className="mt-0.5 text-sm text-gray-600">{product.brandName}</p>
            <p className="mt-1 text-sm text-gray-600">{formatPrice(product.price)}</p>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-gray-100 bg-white p-5">
        <h2 className="text-xs font-medium uppercase tracking-wider text-gray-500">
          노출 설정
        </h2>
        <div className="mt-5 space-y-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">노출 여부</span>
            <div className="flex items-center gap-2">
              <DisplayToggleSwitch
                checked={product.isDisplayed}
                onChange={setDisplay}
              />
              <span className="text-xs text-gray-500">
                {product.isDisplayed ? '노출' : '비노출'}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">메인 진열</span>
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={product.isMainDisplay ?? false}
                onChange={(e) => setMainDisplay(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-500"
              />
              <span className="text-sm text-gray-600">메인에 진열</span>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">정렬 우선순위</span>
            <DisplayOrderInput
              value={product.displayOrder ?? 0}
              onChange={setOrder}
            />
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-gray-100 bg-white p-5">
        <h2 className="text-xs font-medium uppercase tracking-wider text-gray-500">
          카테고리별 진열
        </h2>
        <p className="mt-1 text-xs text-gray-500">해당 카테고리 목록에 노출할지 설정합니다.</p>
        <ul className="mt-4 space-y-3">
          {CATEGORIES.map((cat) => (
            <li key={cat} className="flex items-center justify-between">
              <span className="text-sm text-gray-700">{cat}</span>
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={product.categoryDisplays?.[cat] ?? false}
                  onChange={(e) => setCategoryDisplay(cat, e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-500"
                />
                <span className="text-xs text-gray-500">진열</span>
              </label>
            </li>
          ))}
        </ul>
      </section>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleSave}
          className="rounded-md border border-gray-800 bg-gray-800 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-700"
        >
          저장
        </button>
        <Link
          href="/admin/products/display"
          className="rounded-md border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
        >
          취소
        </Link>
      </div>
    </div>
  );
}
