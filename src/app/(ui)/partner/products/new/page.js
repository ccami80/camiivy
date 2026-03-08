'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ProductImageField from '@/components/partner/ProductImageField';

const PARTNER_TOKEN_KEY = 'partnerToken';

// 예시 적용 시 넣을 문구 (그대로 적용 후 수정 가능)
const EXAMPLE_VALUES = {
  name: '프리미엄 강아지 사료 2kg',
  modelName: 'DOG-FOOD-2000',
  manufacturer: '(주)펫푸드코리아',
  countryOfOrigin: '대한민국',
  returnAddress: '경기도 성남시 분당구 판교로 123 펫푸드 물류센터 (우)13487',
  sizeOption: 'S, M, L',
  colorOption: '빨강, 네이비, 아이보리',
  description: '영양 균형이 잡힌 프리미엄 사료입니다.\n반려견의 연령과 체중에 맞춰 급여량을 조절해 주세요.',
  shippingMethod: '택배',
  shippingPeriod: '주문 후 2~3일',
  shippingNote: '제주/도서산간 추가비용 발생 시 안내드립니다.',
  shippingFee: '3000',
};

export default function PartnerProductNewPage() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    modelName: '',
    brand: '',
    categoryId: '',
    basePrice: '',
    totalStock: '0',
    description: '',
    shippingMethod: '',
    shippingPeriod: '',
    shippingNote: '',
    shippingFee: '',
    manufacturer: '',
    countryOfOrigin: '',
    returnAddress: '',
    sizeOption: '',
    colorOption: '',
  });
  const [mainImageUrls, setMainImageUrls] = useState([]);
  const [detailImageUrls, setDetailImageUrls] = useState([]);
  const [sizePrices, setSizePrices] = useState({});

  function getToken() {
    return typeof window !== 'undefined' ? localStorage.getItem(PARTNER_TOKEN_KEY) : null;
  }

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    fetch('/api/categories')
      .then((res) => {
        if (!res.ok) throw new Error('카테고리 로드 실패');
        return res.json();
      })
      .then(setCategories)
      .catch(() => setError('카테고리를 불러올 수 없습니다.'))
      .finally(() => setLoading(false));
  }, []);

  const categoriesForDog = categories.filter((c) => c.petType === 'DOG');

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function applyExample() {
    setForm((prev) => ({
      ...prev,
      ...EXAMPLE_VALUES,
      brand: prev.brand,
      categoryId: prev.categoryId,
      basePrice: prev.basePrice,
      totalStock: prev.totalStock,
    }));
  }

  async function handleImageUpload(files, type) {
    const token = getToken();
    if (!token || !files?.length) return;
    setUploading(true);
    setError('');
    try {
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append('files', files[i]);
      }
      const res = await fetch('/api/partner/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || '업로드 실패');
        setUploading(false);
        return;
      }
      if (type === 'main') {
        setMainImageUrls((prev) => [...prev, ...(data.urls || [])].slice(0, 6));
      } else {
        setDetailImageUrls((prev) => [...prev, ...(data.urls || [])]);
      }
    } catch (err) {
      setError('이미지 업로드 중 오류가 발생했습니다.');
    }
    setUploading(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    const token = getToken();
    if (!token) {
      setError('로그인이 필요합니다.');
      setSubmitting(false);
      return;
    }
    try {
      const res = await fetch('/api/partner/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: form.name.trim(),
          modelName: form.modelName.trim() || undefined,
          brand: form.brand.trim(),
          categoryId: form.categoryId || undefined,
          basePrice: form.basePrice === '' ? undefined : Number(form.basePrice),
          totalStock: form.totalStock === '' ? 0 : Number(form.totalStock),
          description: form.description.trim() || undefined,
          shippingMethod: form.shippingMethod.trim() || undefined,
          shippingPeriod: form.shippingPeriod.trim() || undefined,
          shippingNote: form.shippingNote.trim() || undefined,
          shippingFee: form.shippingFee === '' ? undefined : Number(form.shippingFee),
          manufacturer: form.manufacturer.trim() || undefined,
          countryOfOrigin: form.countryOfOrigin.trim() || undefined,
          returnAddress: form.returnAddress.trim() || undefined,
          sizeOption: form.sizeOption.trim() || undefined,
          colorOption: form.colorOption.trim() || undefined,
          sizePrices: (() => {
            const sizes = (form.sizeOption || '').split(/[,/]/).map((s) => s.trim()).filter(Boolean);
            const base = form.basePrice === '' ? 0 : Number(form.basePrice);
            const sp = {};
            sizes.forEach((size) => {
              const v = sizePrices[size];
              sp[size] = v !== '' && v != null && !Number.isNaN(Number(v)) ? Number(v) : base;
            });
            return sp;
          })(),
          mainImageUrls,
          detailImageUrls,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || '등록에 실패했습니다.');
        setSubmitting(false);
        return;
      }
      router.push('/partner/products?registered=1');
      router.refresh();
    } catch (err) {
      setError('등록 처리 중 오류가 발생했습니다.');
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-500">로딩 중…</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">입점업체 전용 · 상품 등록</h1>
        <Link
          href="/partner/products"
          className="text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          ← 목록
        </Link>
      </div>
      <div className="mt-3 rounded-lg border border-amber-100 bg-amber-50/80 px-4 py-3 text-sm text-amber-900">
        <p className="font-medium">등록 시 상태: 승인 대기 (PENDING)</p>
        <p className="mt-1 text-amber-800">
          관리자 승인 전까지 쇼핑몰에 <strong>노출되지 않습니다</strong>. 승인된 상품만 사이트·검색에 노출됩니다.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="mt-8 max-w-xl space-y-6">
        {error && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-700" role="alert">
            {error}
          </div>
        )}

        <ProductImageField
          urls={mainImageUrls}
          setUrls={setMainImageUrls}
          onUpload={handleImageUpload}
          uploading={uploading}
          type="main"
          title="상품 이미지 (대표/갤러리)"
          description="리스트·상세 상단 갤러리용. 최대 6장. JPEG, PNG, WebP, GIF (5MB 이하). 첫 번째가 대표 이미지입니다. 드래그로 순서 변경 가능."
          thumbSize="h-20 w-20"
          maxCount={6}
        />

        <ProductImageField
          urls={detailImageUrls}
          setUrls={setDetailImageUrls}
          onUpload={handleImageUpload}
          uploading={uploading}
          type="detail"
          title="상세 설명 이미지"
          description="상품 상세 하단에 순서대로 노출됩니다. 여러 장 한꺼번에 선택 가능. 드래그로 순서 변경 가능."
          thumbSize="h-24 w-24"
        />

        <div className="flex items-center gap-3 rounded-lg border border-dashed border-gray-300 bg-gray-50/50 px-4 py-3">
          <span className="text-sm text-gray-600">예시 문구를 그대로 채우려면 아래 버튼을 누르세요. 적용 후에도 수정할 수 있습니다.</span>
          <button
            type="button"
            onClick={applyExample}
            className="shrink-0 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
          >
            예시 그대로 적용
          </button>
        </div>

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            품명 <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            value={form.name}
            onChange={handleChange}
            placeholder="상품명을 입력하세요"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
          />
        </div>
        <div>
          <label htmlFor="modelName" className="block text-sm font-medium text-gray-700">
            모델명
          </label>
          <p className="mt-0.5 text-xs text-gray-500">제조사·브랜드의 형식/모델 번호 (선택). 예: DOG-FOOD-2000, H-2024-M</p>
          <input
            id="modelName"
            name="modelName"
            type="text"
            value={form.modelName}
            onChange={handleChange}
            placeholder="선택 입력"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
          />
        </div>
        <div>
          <label htmlFor="brand" className="block text-sm font-medium text-gray-700">
            브랜드 <span className="text-red-500">*</span>
          </label>
          <p className="mt-0.5 text-xs text-gray-500">입점업체가 등록하는 브랜드명입니다. 한 업체가 여러 브랜드를 사용할 수 있습니다.</p>
          <input
            id="brand"
            name="brand"
            type="text"
            required
            value={form.brand}
            onChange={handleChange}
            placeholder="예: 까미, 아이비, 자사 브랜드명"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
          />
        </div>
        <div>
          <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700">
            카테고리 <span className="text-red-500">*</span>
          </label>
          <select
            id="categoryId"
            name="categoryId"
            required
            value={form.categoryId}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
          >
            <option value="">선택</option>
            {categoriesForDog.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="basePrice" className="block text-sm font-medium text-gray-700">
              가격 (원) <span className="text-red-500">*</span>
            </label>
            <input
              id="basePrice"
              name="basePrice"
              type="number"
              min="0"
              required
              value={form.basePrice}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
            />
          </div>
          <div>
            <label htmlFor="totalStock" className="block text-sm font-medium text-gray-700">
              재고
            </label>
            <input
              id="totalStock"
              name="totalStock"
              type="number"
              min="0"
              value={form.totalStock}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
            />
          </div>
        </div>
        <div>
          <label htmlFor="shippingFee" className="block text-sm font-medium text-gray-700">
            배송비 (원)
          </label>
          <input
            id="shippingFee"
            name="shippingFee"
            type="number"
            min="0"
            value={form.shippingFee}
            onChange={handleChange}
            placeholder="0 또는 비워두면 미정"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="manufacturer" className="block text-sm font-medium text-gray-700">
              제조사 / 수입사
            </label>
            <input
              id="manufacturer"
              name="manufacturer"
              type="text"
              value={form.manufacturer}
              onChange={handleChange}
              placeholder="제조사 또는 수입사명"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
            />
          </div>
          <div>
            <label htmlFor="countryOfOrigin" className="block text-sm font-medium text-gray-700">
              제조국
            </label>
            <input
              id="countryOfOrigin"
              name="countryOfOrigin"
              type="text"
              value={form.countryOfOrigin}
              onChange={handleChange}
              placeholder="예: 대한민국, 중국"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
            />
          </div>
        </div>
        <div>
          <label htmlFor="returnAddress" className="block text-sm font-medium text-gray-700">
            교환 / 반품 주소
          </label>
          <textarea
            id="returnAddress"
            name="returnAddress"
            rows={2}
            value={form.returnAddress}
            onChange={handleChange}
            placeholder="교환·반품 접수 주소"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="sizeOption" className="block text-sm font-medium text-gray-700">
              사이즈
            </label>
            <input
              id="sizeOption"
              name="sizeOption"
              type="text"
              value={form.sizeOption}
              onChange={handleChange}
              placeholder="예: S, M, L 또는 1호, 2호"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
            />
          </div>
          <div>
            <label htmlFor="colorOption" className="block text-sm font-medium text-gray-700">
              색상
            </label>
            <input
              id="colorOption"
              name="colorOption"
              type="text"
              value={form.colorOption}
              onChange={handleChange}
              placeholder="예: 빨강, 네이비, 아이보리"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
            />
          </div>
        </div>
        {form.sizeOption && (() => {
          const sizes = form.sizeOption.split(/[,/]/).map((s) => s.trim()).filter(Boolean);
          if (sizes.length === 0) return null;
          return (
            <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-4">
              <p className="text-sm font-medium text-gray-700">사이즈별 가격 (원)</p>
              <p className="mt-0.5 text-xs text-gray-500">
                비워두면 기본가와 동일합니다. 사이즈마다 다른 가격을 넣을 수 있습니다.
              </p>
              <div className="mt-3 flex flex-wrap gap-4">
                {sizes.map((size) => (
                  <div key={size} className="flex items-center gap-2">
                    <label htmlFor={`sizePrice-${size}`} className="text-sm text-gray-600">
                      {size}
                    </label>
                    <input
                      id={`sizePrice-${size}`}
                      type="number"
                      min="0"
                      placeholder={form.basePrice || '기본가'}
                      value={sizePrices[size] ?? ''}
                      onChange={(e) => setSizePrices((prev) => ({ ...prev, [size]: e.target.value }))}
                      className="w-28 rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
                    />
                    <span className="text-xs text-gray-500">원</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            상품 설명
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            value={form.description}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
          />
        </div>
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-700">배송 정보</h3>
          <div>
            <label htmlFor="shippingMethod" className="block text-sm text-gray-600">
              배송 방법
            </label>
            <input
              id="shippingMethod"
              name="shippingMethod"
              type="text"
              value={form.shippingMethod}
              onChange={handleChange}
              placeholder="예: 택배, 퀵배송, 화물"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
            />
          </div>
          <div>
            <label htmlFor="shippingPeriod" className="block text-sm text-gray-600">
              배송 기간
            </label>
            <input
              id="shippingPeriod"
              name="shippingPeriod"
              type="text"
              value={form.shippingPeriod}
              onChange={handleChange}
              placeholder="예: 주문 후 2~3일, 당일 배송"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
            />
          </div>
          <div>
            <label htmlFor="shippingNote" className="block text-sm text-gray-600">
              배송 유의사항 (선택)
            </label>
            <textarea
              id="shippingNote"
              name="shippingNote"
              rows={2}
              value={form.shippingNote}
              onChange={handleChange}
              placeholder="예: 제주/도서산간 추가비용, 배송 불가 지역 등"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
            />
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {submitting ? '등록 중…' : '등록'}
          </button>
          <Link
            href="/partner/products"
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            취소
          </Link>
        </div>
      </form>
    </div>
  );
}
