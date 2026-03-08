'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { DETAIL_TEMPLATE_TYPES, getTemplateLabel } from '@/lib/ai-detail';

const ADMIN_TOKEN_KEY = 'adminToken';

const statusLabel = {
  PENDING: '승인 대기',
  APPROVED: '승인됨',
  REJECTED: '반려',
};

const brandLabel = { CAMI: '까미', IVY: '아이비' };
const petLabel = { DOG: '강아지', CAT: '고양이' };

export default function AdminProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [acting, setActing] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [aiTemplateType, setAiTemplateType] = useState(DETAIL_TEMPLATE_TYPES.PREMIUM_LIFESTYLE);
  const [aiInputSummary, setAiInputSummary] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [generating, setGenerating] = useState(false);
  const [savingDetail, setSavingDetail] = useState(false);

  function getToken() {
    return typeof window !== 'undefined' ? localStorage.getItem(ADMIN_TOKEN_KEY) : null;
  }

  useEffect(() => {
    if (!id) return;
    const token = getToken();
    if (!token) return;
    fetch(`/api/admin/products/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        if (res.status === 404) throw new Error('상품을 찾을 수 없습니다.');
        if (!res.ok) throw new Error('로드 실패');
        return res.json();
      })
      .then((p) => {
        setProduct(p);
        setGeneratedContent(p.detailContent ?? '');
        setAiTemplateType(p.detailTemplateType && Object.values(DETAIL_TEMPLATE_TYPES).includes(p.detailTemplateType) ? p.detailTemplateType : DETAIL_TEMPLATE_TYPES.PREMIUM_LIFESTYLE);
      })
      .catch((err) => setError(err.message || '상품을 불러올 수 없습니다.'))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleGenerateDetail() {
    const token = getToken();
    if (!token) return;
    setGenerating(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/products/${id}/generate-detail`, {
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
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ detailContent: generatedContent, detailTemplateType: aiTemplateType }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '저장 실패');
      setProduct((prev) => prev ? { ...prev, detailContent: generatedContent, detailTemplateType: aiTemplateType } : null);
      setError('');
      router.refresh();
    } catch (err) {
      setError(err.message || '상세 콘텐츠 저장 중 오류가 발생했습니다.');
    }
    setSavingDetail(false);
  }

  async function handleApproval(approvalStatus, reason) {
    const token = getToken();
    if (!token) return;
    setActing(true);
    setError('');
    try {
      const body = approvalStatus === 'REJECTED'
        ? { approvalStatus: 'REJECTED', rejectionReason: reason || undefined }
        : { approvalStatus: 'APPROVED' };
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '처리 실패');
      router.push('/admin/products');
      router.refresh();
    } catch (err) {
      setError(err.message || '처리 중 오류가 발생했습니다.');
    } finally {
      setActing(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-500">로딩 중…</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div>
        <p className="text-red-600">{error || '상품을 찾을 수 없습니다.'}</p>
        <Link href="/admin/products" className="mt-4 inline-block text-sm font-medium text-gray-600 hover:text-gray-900">
          ← 목록
        </Link>
      </div>
    );
  }

  const mainImages = (product.images || []).filter((img) => img.type === 'main');
  const detailImages = (product.images || []).filter((img) => img.type === 'detail');

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">상품 상세 확인</h1>
        <Link href="/admin/products" className="text-sm font-medium text-gray-600 hover:text-gray-900">
          ← 목록
        </Link>
      </div>
      <p className="mt-1 text-sm text-gray-500">
        상품 정보를 확인한 뒤 승인 또는 반려(사유 입력) 처리하세요. 승인된 상품만 사용자 페이지에 노출됩니다.
      </p>

      {error && (
        <div className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700" role="alert">
          {error}
        </div>
      )}

      <div className="mt-6 flex gap-4">
        <span
          className={`rounded-full px-3 py-1 text-sm font-medium ${
            product.approvalStatus === 'PENDING'
              ? 'bg-amber-100 text-amber-800'
              : product.approvalStatus === 'APPROVED'
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
          }`}
        >
          {statusLabel[product.approvalStatus] ?? product.approvalStatus}
        </span>
        {product.rejectionReason && (
          <p className="text-sm text-red-700">반려 사유: {product.rejectionReason}</p>
        )}
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="text-sm font-semibold text-gray-700">이미지</h2>
          <div className="mt-2 space-y-4">
            {mainImages.length > 0 ? (
              mainImages.map((img) => (
                <div key={img.id} className="overflow-hidden rounded-lg border border-gray-200">
                  <img src={img.url} alt="" className="w-full object-contain" style={{ maxHeight: 300 }} />
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">대표 이미지 없음</p>
            )}
            {detailImages.length > 0 && (
              <div className="pt-4">
                <p className="text-xs font-medium text-gray-500">상세 이미지</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {detailImages.map((img) => (
                    <img key={img.id} src={img.url} alt="" className="h-24 w-24 rounded border object-cover" />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-sm font-semibold text-gray-700">기본 정보</h2>
            <dl className="mt-2 space-y-1 text-sm">
              <div><dt className="inline text-gray-500">상품명 </dt><dd className="inline font-medium">{product.name}</dd></div>
              {product.modelName && <div><dt className="inline text-gray-500">모델명 </dt><dd className="inline">{product.modelName}</dd></div>}
              <div><dt className="inline text-gray-500">브랜드/반려동물 </dt><dd className="inline">{brandLabel[product.brand] || product.brand} / {petLabel[product.petType] || product.petType}</dd></div>
              <div><dt className="inline text-gray-500">카테고리 </dt><dd className="inline">{product.category?.name}</dd></div>
              <div><dt className="inline text-gray-500">가격 </dt><dd className="inline">{product.basePrice?.toLocaleString()}원</dd></div>
              <div><dt className="inline text-gray-500">재고 </dt><dd className="inline">{product.totalStock ?? 0}개</dd></div>
              <div><dt className="inline text-gray-500">입점업체 </dt><dd className="inline">{product.partner?.companyName} ({product.partner?.email})</dd></div>
            </dl>
          </div>
          {product.description && (
            <div>
              <h2 className="text-sm font-semibold text-gray-700">상품 설명</h2>
              <p className="mt-2 whitespace-pre-wrap text-sm text-gray-600">{product.description}</p>
            </div>
          )}
          {(product.manufacturer || product.countryOfOrigin || product.returnAddress) && (
            <div>
              <h2 className="text-sm font-semibold text-gray-700">상품 필수 정보</h2>
              <dl className="mt-2 space-y-1 text-sm text-gray-600">
                {product.manufacturer && <div><dt className="inline text-gray-500">제조사/수입사 </dt><dd className="inline">{product.manufacturer}</dd></div>}
                {product.countryOfOrigin && <div><dt className="inline text-gray-500">제조국 </dt><dd className="inline">{product.countryOfOrigin}</dd></div>}
                {product.returnAddress && <div><dt className="inline text-gray-500">교환/반품주소 </dt><dd className="inline whitespace-pre-wrap">{product.returnAddress}</dd></div>}
              </dl>
            </div>
          )}
          {(product.shippingMethod || product.shippingPeriod || product.shippingFee != null) && (
            <div>
              <h2 className="text-sm font-semibold text-gray-700">배송</h2>
              <dl className="mt-2 space-y-1 text-sm text-gray-600">
                {product.shippingMethod && <div><dt className="inline text-gray-500">배송 방법 </dt><dd className="inline">{product.shippingMethod}</dd></div>}
                {product.shippingPeriod && <div><dt className="inline text-gray-500">배송 기간 </dt><dd className="inline">{product.shippingPeriod}</dd></div>}
                {product.shippingFee != null && <div><dt className="inline text-gray-500">배송비 </dt><dd className="inline">{product.shippingFee === 0 ? '무료' : `${product.shippingFee?.toLocaleString()}원`}</dd></div>}
              </dl>
            </div>
          )}

          <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-4 space-y-4">
            <h2 className="text-sm font-semibold text-gray-700">AI 상세 콘텐츠</h2>
            <p className="text-xs text-gray-500">OPENAI_API_KEY가 있으면 AI가 생성하고, 없으면 선택한 템플릿으로 기본 문구가 채워집니다. 템플릿을 바꾼 뒤에는 반드시 다시 「AI 생성」을 눌러야 새 문구로 바뀝니다.</p>
            <div className="rounded-md bg-blue-50 border border-blue-100 px-3 py-2 text-xs text-blue-800">
              <strong>순서:</strong> 템플릿 선택 → (선택) 입력 내용 입력 → <strong>AI 생성</strong> 클릭 → HTML 확인·수정 → <strong>상세 콘텐츠 저장</strong> 클릭.
            </div>
            <div>
              <label htmlFor="ai-template" className="block text-sm font-medium text-gray-700">템플릿</label>
              <select id="ai-template" value={aiTemplateType} onChange={(e) => setAiTemplateType(e.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500">
                {Object.values(DETAIL_TEMPLATE_TYPES).map((t) => (
                  <option key={t} value={t}>{getTemplateLabel(t)}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="ai-input" className="block text-sm font-medium text-gray-700">입력 내용</label>
              <textarea id="ai-input" rows={2} value={aiInputSummary} onChange={(e) => setAiInputSummary(e.target.value)} placeholder="참고할 문구, 특징 등" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500" />
            </div>
            <div className="flex gap-2">
              <button type="button" disabled={generating} onClick={handleGenerateDetail} className="rounded-md bg-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50">
                {generating ? '생성 중…' : 'AI 생성'}
              </button>
              <button type="button" disabled={savingDetail || !generatedContent} onClick={handleSaveDetailContent} className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">
                {savingDetail ? '저장 중…' : '상세 콘텐츠 저장'}
              </button>
            </div>
            <div>
              <label htmlFor="generated-content" className="block text-sm font-medium text-gray-700">상세 콘텐츠 (HTML, 수정 가능)</label>
              <textarea id="generated-content" rows={8} value={generatedContent} onChange={(e) => setGeneratedContent(e.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500" />
            </div>
          </div>
        </div>
      </div>

      {product.approvalStatus === 'PENDING' && (
        <div className="mt-10 border-t border-gray-200 pt-8">
          <h2 className="text-sm font-semibold text-gray-700">승인 / 반려 처리</h2>
          <div className="mt-4 flex flex-wrap items-end gap-4">
            <button
              type="button"
              disabled={acting}
              onClick={() => handleApproval('APPROVED')}
              className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
            >
              {acting ? '처리 중…' : '승인'}
            </button>
            <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-end">
              <div className="min-w-0 flex-1">
                <label htmlFor="reject-reason" className="block text-sm font-medium text-gray-700">
                  반려 사유 (선택)
                </label>
                <textarea
                  id="reject-reason"
                  rows={2}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="반려 시 입점업체에 전달할 사유를 입력하세요."
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
                />
              </div>
              <button
                type="button"
                disabled={acting}
                onClick={() => handleApproval('REJECTED', rejectReason)}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 shrink-0"
              >
                반려
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
