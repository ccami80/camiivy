'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { DETAIL_TEMPLATE_TYPES, getTemplateLabel } from '@/lib/ai-detail';
import ProductImageField from '@/components/partner/ProductImageField';

const PARTNER_TOKEN_KEY = 'partnerToken';

export default function PartnerProductEditPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;
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
  // AI 상세 콘텐츠
  const [aiTemplateType, setAiTemplateType] = useState(DETAIL_TEMPLATE_TYPES.PREMIUM_LIFESTYLE);
  const [aiInputSummary, setAiInputSummary] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [generating, setGenerating] = useState(false);
  const [savingDetail, setSavingDetail] = useState(false);
  const [sizePrices, setSizePrices] = useState({});

  function getToken() {
    return typeof window !== 'undefined' ? localStorage.getItem(PARTNER_TOKEN_KEY) : null;
  }

  useEffect(() => {
    if (!id) return;
    const token = getToken();
    if (!token) return;
    Promise.all([
      fetch('/api/categories').then((r) => (r.ok ? r.json() : [])),
      fetch(`/api/partner/products/${id}`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => {
        if (!r.ok) throw new Error('상품을 불러올 수 없습니다.');
        return r.json();
      }),
    ])
      .then(([cats, product]) => {
        setCategories(cats);
        setForm({
          name: product.name ?? '',
          modelName: product.modelName ?? '',
          brand: product.brand ?? '',
          categoryId: product.categoryId ?? '',
          basePrice: product.basePrice != null ? String(product.basePrice) : '',
          totalStock: product.totalStock != null ? String(product.totalStock) : '0',
          description: product.description ?? '',
          shippingMethod: product.shippingMethod ?? '',
          shippingPeriod: product.shippingPeriod ?? '',
          shippingNote: product.shippingNote ?? '',
          shippingFee: product.shippingFee != null ? String(product.shippingFee) : '',
          manufacturer: product.manufacturer ?? '',
          countryOfOrigin: product.countryOfOrigin ?? '',
          returnAddress: product.returnAddress ?? '',
          sizeOption: product.sizeOption ?? '',
          colorOption: product.colorOption ?? '',
        });
        const base = product.basePrice ?? 0;
        const sizePricesInit = {};
        (product.variants || []).forEach((v) => {
          sizePricesInit[v.optionLabel] = String((base + (v.priceAdjust ?? 0)));
        });
        setSizePrices(sizePricesInit);
        const main = (product.images || []).filter((i) => i.type === 'main').sort((a, b) => a.sortOrder - b.sortOrder).map((i) => i.url).slice(0, 6);
        const detail = (product.images || []).filter((i) => i.type === 'detail').sort((a, b) => a.sortOrder - b.sortOrder).map((i) => i.url);
        setMainImageUrls(main);
        setDetailImageUrls(detail);
        setGeneratedContent(product.detailContent ?? '');
        setAiTemplateType(product.detailTemplateType && Object.values(DETAIL_TEMPLATE_TYPES).includes(product.detailTemplateType) ? product.detailTemplateType : DETAIL_TEMPLATE_TYPES.PREMIUM_LIFESTYLE);
      })
      .catch((err) => setError(err.message || '로드 실패'))
      .finally(() => setLoading(false));
  }, [id]);

  const categoriesForDog = categories.filter((c) => c.petType === 'DOG');

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleImageUpload(files, type) {
    const token = getToken();
    if (!token || !files?.length) return;
    setUploading(true);
    setError('');
    try {
      const formData = new FormData();
      files.forEach((f) => formData.append('files', f));
      const res = await fetch('/api/partner/upload', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '업로드 실패');
      if (type === 'main') setMainImageUrls((prev) => [...prev, ...(data.urls || [])].slice(0, 6));
      else setDetailImageUrls((prev) => [...prev, ...(data.urls || [])]);
    } catch (err) {
      setError('이미지 업로드 중 오류가 발생했습니다.');
    }
    setUploading(false);
  }

  async function handleGenerateDetail() {
    const token = getToken();
    if (!token) return;
    setGenerating(true);
    setError('');
    try {
      const res = await fetch(`/api/partner/products/${id}/generate-detail`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ templateType: aiTemplateType, inputSummary: aiInputSummary }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '생성 실패');
      setGeneratedContent(data.content ?? '');
      if (data.templateType) setAiTemplateType(data.templateType);
    } catch (err) {
      setError(err.message || '상세 콘텐츠 생성 중 오류가 발생했습니다.');
    }
    setGenerating(false);
  }

  async function handleSaveDetailContent() {
    const token = getToken();
    if (!token) return;
    setSavingDetail(true);
    setError('');
    try {
      const res = await fetch(`/api/partner/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ detailContent: generatedContent, detailTemplateType: aiTemplateType }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '저장 실패');
      setError('');
      router.push(`/products/${id}`);
      router.refresh();
    } catch (err) {
      setError(err.message || '상세 콘텐츠 저장 중 오류가 발생했습니다.');
    }
    setSavingDetail(false);
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
      const res = await fetch(`/api/partner/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
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
          detailContent: generatedContent || undefined,
          detailTemplateType: aiTemplateType || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '수정에 실패했습니다.');
      router.push('/partner/products');
      router.refresh();
    } catch (err) {
      setError(err.message || '수정 처리 중 오류가 발생했습니다.');
    }
    setSubmitting(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-500">로딩 중…</p>
      </div>
    );
  }

  if (error && !form.name) {
    return (
      <div>
        <p className="text-red-600">{error}</p>
        <Link href="/partner/products" className="mt-4 inline-block text-sm font-medium text-gray-600 hover:text-gray-900">← 목록</Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">상품 수정</h1>
        <Link href="/partner/products" className="text-sm font-medium text-gray-600 hover:text-gray-900">← 목록</Link>
      </div>
      <p className="mt-1 text-sm text-gray-500">수정 후 저장하면 반영됩니다. 승인 상태는 관리자만 변경할 수 있습니다.</p>

      <form onSubmit={handleSubmit} className="mt-8 max-w-xl space-y-6">
        {error && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-700" role="alert">{error}</div>
        )}

        <ProductImageField
          urls={mainImageUrls}
          setUrls={setMainImageUrls}
          onUpload={handleImageUpload}
          uploading={uploading}
          type="main"
          title="상품 이미지 (대표/갤러리)"
          description="첫 번째가 대표 이미지입니다. 최대 6장까지. 여러 장 한꺼번에 선택·드래그로 순서 변경 가능."
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
          description="상세 하단에 순서대로 노출. 여러 장 한꺼번에 선택·드래그로 순서 변경 가능."
          thumbSize="h-24 w-24"
        />

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">품명 <span className="text-red-500">*</span></label>
          <input id="name" name="name" type="text" required value={form.name} onChange={handleChange} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500" />
        </div>
        <div>
          <label htmlFor="modelName" className="block text-sm font-medium text-gray-700">모델명</label>
          <p className="mt-0.5 text-xs text-gray-500">제조사·브랜드의 형식/모델 번호 (선택). 예: DOG-FOOD-2000, H-2024-M</p>
          <input id="modelName" name="modelName" type="text" value={form.modelName} onChange={handleChange} placeholder="선택 입력" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500" />
        </div>
        <div>
          <label htmlFor="brand" className="block text-sm font-medium text-gray-700">브랜드 <span className="text-red-500">*</span></label>
          <p className="mt-0.5 text-xs text-gray-500">입점업체가 등록하는 브랜드명입니다. 한 업체가 여러 브랜드를 사용할 수 있습니다.</p>
          <input id="brand" name="brand" type="text" required value={form.brand} onChange={handleChange} placeholder="예: 까미, 아이비, 자사 브랜드명" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500" />
        </div>
        <div>
          <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700">카테고리 <span className="text-red-500">*</span></label>
          <select id="categoryId" name="categoryId" required value={form.categoryId} onChange={handleChange} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500">
            <option value="">선택</option>
            {categoriesForDog.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="basePrice" className="block text-sm font-medium text-gray-700">가격 (원) <span className="text-red-500">*</span></label>
            <input id="basePrice" name="basePrice" type="number" min="0" required value={form.basePrice} onChange={handleChange} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500" />
          </div>
          <div>
            <label htmlFor="totalStock" className="block text-sm font-medium text-gray-700">재고</label>
            <input id="totalStock" name="totalStock" type="number" min="0" value={form.totalStock} onChange={handleChange} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500" />
          </div>
        </div>
        <div>
          <label htmlFor="shippingFee" className="block text-sm font-medium text-gray-700">배송비 (원)</label>
          <input id="shippingFee" name="shippingFee" type="number" min="0" value={form.shippingFee} onChange={handleChange} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="manufacturer" className="block text-sm font-medium text-gray-700">제조사 / 수입사</label>
            <input id="manufacturer" name="manufacturer" type="text" value={form.manufacturer} onChange={handleChange} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500" />
          </div>
          <div>
            <label htmlFor="countryOfOrigin" className="block text-sm font-medium text-gray-700">제조국</label>
            <input id="countryOfOrigin" name="countryOfOrigin" type="text" value={form.countryOfOrigin} onChange={handleChange} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500" />
          </div>
        </div>
        <div>
          <label htmlFor="returnAddress" className="block text-sm font-medium text-gray-700">교환 / 반품 주소</label>
          <textarea id="returnAddress" name="returnAddress" rows={2} value={form.returnAddress} onChange={handleChange} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="sizeOption" className="block text-sm font-medium text-gray-700">사이즈</label>
            <input id="sizeOption" name="sizeOption" type="text" value={form.sizeOption} onChange={handleChange} placeholder="예: S, M, L" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500" />
          </div>
          <div>
            <label htmlFor="colorOption" className="block text-sm font-medium text-gray-700">색상</label>
            <input id="colorOption" name="colorOption" type="text" value={form.colorOption} onChange={handleChange} placeholder="예: 빨강, 네이비" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500" />
          </div>
        </div>
        {form.sizeOption && (() => {
          const sizes = form.sizeOption.split(/[,/]/).map((s) => s.trim()).filter(Boolean);
          if (sizes.length === 0) return null;
          return (
            <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-4">
              <p className="text-sm font-medium text-gray-700">사이즈별 가격 (원)</p>
              <p className="mt-0.5 text-xs text-gray-500">비워두면 기본가와 동일합니다. 사이즈마다 다른 가격을 넣을 수 있습니다.</p>
              <div className="mt-3 flex flex-wrap gap-4">
                {sizes.map((size) => (
                  <div key={size} className="flex items-center gap-2">
                    <label htmlFor={`sizePrice-${size}`} className="text-sm text-gray-600">{size}</label>
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
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">상품 설명</label>
          <textarea id="description" name="description" rows={3} value={form.description} onChange={handleChange} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500" />
        </div>

        <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-4 space-y-4">
          <h3 className="text-sm font-semibold text-gray-800">AI 상세 콘텐츠 생성</h3>
          <p className="text-xs text-gray-500">상품 상세 페이지에 넣을 HTML을 생성합니다. 서버에 OPENAI_API_KEY가 있으면 AI가 생성하고, 없으면 선택한 템플릿으로 기본 문구가 채워집니다.</p>
          <div className="rounded-md bg-blue-50 border border-blue-100 px-3 py-2 text-xs text-blue-800">
            <strong>사용 순서:</strong> ① 템플릿 선택 → ② (선택) 입력 내용 입력 → ③ <strong>「AI 생성」</strong> 클릭 → ④ 아래 HTML 확인·수정 → ⑤ <strong>「상세 콘텐츠 저장」</strong> 클릭 → 상세 페이지에서 반영 확인. 템플릿만 바꾼 뒤에는 반드시 <strong>다시 「AI 생성」</strong>을 눌러야 새 문구로 바뀝니다.
          </div>
          <div>
            <label htmlFor="ai-template" className="block text-sm font-medium text-gray-700">템플릿</label>
            <select id="ai-template" value={aiTemplateType} onChange={(e) => setAiTemplateType(e.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500">
              {Object.values(DETAIL_TEMPLATE_TYPES).map((t) => (
                <option key={t} value={t}>{getTemplateLabel(t)}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="ai-input" className="block text-sm font-medium text-gray-700">입력 내용 (참고용)</label>
            <textarea id="ai-input" rows={3} value={aiInputSummary} onChange={(e) => setAiInputSummary(e.target.value)} placeholder="상세 페이지에 넣고 싶은 문구, 특징, 타겟 등 자유롭게 입력하세요." className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500" />
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" disabled={generating} onClick={handleGenerateDetail} className="rounded-md bg-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50">
              {generating ? '생성 중…' : 'AI 생성'}
            </button>
            <button type="button" disabled={savingDetail || !generatedContent} onClick={handleSaveDetailContent} className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">
              {savingDetail ? '저장 중…' : '상세 콘텐츠 저장'}
            </button>
            <Link
              href={`/products/${id}`}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              상세 페이지에서 보기
            </Link>
          </div>
          <div>
            <label htmlFor="generated-content" className="block text-sm font-medium text-gray-700">생성/수정된 상세 콘텐츠 (HTML, 수정 가능)</label>
            <textarea id="generated-content" rows={12} value={generatedContent} onChange={(e) => setGeneratedContent(e.target.value)} placeholder="AI 생성 버튼을 누르거나 여기에 HTML을 직접 입력하세요." className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500" />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-700">배송 정보</h3>
          <div>
            <label htmlFor="shippingMethod" className="block text-sm text-gray-600">배송 방법</label>
            <input id="shippingMethod" name="shippingMethod" type="text" value={form.shippingMethod} onChange={handleChange} placeholder="예: 택배" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500" />
          </div>
          <div>
            <label htmlFor="shippingPeriod" className="block text-sm text-gray-600">배송 기간</label>
            <input id="shippingPeriod" name="shippingPeriod" type="text" value={form.shippingPeriod} onChange={handleChange} placeholder="예: 주문 후 2~3일" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500" />
          </div>
          <div>
            <label htmlFor="shippingNote" className="block text-sm text-gray-600">배송 유의사항</label>
            <textarea id="shippingNote" name="shippingNote" rows={2} value={form.shippingNote} onChange={handleChange} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500" />
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={submitting} className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50">
            {submitting ? '저장 중…' : '저장'}
          </button>
          <Link href="/partner/products" className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">취소</Link>
        </div>
      </form>
    </div>
  );
}
