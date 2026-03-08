'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

const PARTNER_TOKEN_KEY = 'partnerToken';

export default function PartnerProductPreviewPage() {
  const params = useParams();
  const id = params?.id;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    const token = typeof window !== 'undefined' ? localStorage.getItem(PARTNER_TOKEN_KEY) : null;
    if (!token) {
      setError('로그인이 필요합니다.');
      setLoading(false);
      return;
    }
    fetch(`/api/partner/products/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => {
        if (!r.ok) throw new Error('상품을 불러올 수 없습니다.');
        return r.json();
      })
      .then(setProduct)
      .catch((err) => setError(err.message || '로드 실패'))
      .finally(() => setLoading(false));
  }, [id]);

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
        <Link href="/partner/products" className="mt-4 inline-block text-sm font-medium text-gray-600 hover:text-gray-900">← 목록</Link>
      </div>
    );
  }

  const mainImages = (product.images || []).filter((i) => i.type === 'main').sort((a, b) => a.sortOrder - b.sortOrder);
  const detailImages = (product.images || []).filter((i) => i.type === 'detail').sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-gray-900">상품 미리보기</h1>
        <div className="flex gap-2">
          <Link
            href={`/partner/products/${id}/edit`}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            수정하기
          </Link>
          <Link href="/partner/products" className="text-sm font-medium text-gray-600 hover:text-gray-900">← 목록</Link>
        </div>
      </div>
      <p className="mt-1 text-sm text-gray-500">고객에게 노출되는 상품 상세 화면을 미리 확인할 수 있습니다. (승인 후 실제 상품 페이지에 반영됩니다)</p>

      <div className="mt-8 mx-auto max-w-3xl space-y-8">
        <section>
          <h2 className="text-xs font-medium uppercase tracking-wider text-gray-500 mb-3">기본 정보</h2>
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <p className="text-lg font-semibold text-gray-900">{product.name}</p>
            {product.modelName && <p className="mt-1 text-sm text-gray-500">{product.modelName}</p>}
            <p className="mt-2 text-gray-700">{product.basePrice != null ? `${Number(product.basePrice).toLocaleString()}원` : '—'}</p>
          </div>
        </section>

        {mainImages.length > 0 && (
          <section>
            <h2 className="text-xs font-medium uppercase tracking-wider text-gray-500 mb-3">대표 이미지</h2>
            <div className="flex flex-wrap gap-3">
              {mainImages.map((img) => (
                <img key={img.id || img.url} src={img.url} alt="" className="h-32 w-32 rounded-lg border border-gray-200 object-cover" />
              ))}
            </div>
          </section>
        )}

        {detailImages.length > 0 && (
          <section>
            <h2 className="text-xs font-medium uppercase tracking-wider text-gray-500 mb-3">상세 이미지</h2>
            <div className="flex flex-wrap gap-3">
              {detailImages.map((img) => (
                <img key={img.id || img.url} src={img.url} alt="" className="max-h-48 rounded-lg border border-gray-200 object-contain" />
              ))}
            </div>
          </section>
        )}

        <section>
          <h2 className="text-xs font-medium uppercase tracking-wider text-gray-500 mb-3">상세 콘텐츠</h2>
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            {product.detailContent ? (
              <div
                className="prose prose-sm max-w-none prose-img:rounded-lg"
                dangerouslySetInnerHTML={{ __html: product.detailContent }}
              />
            ) : (
              <p className="text-gray-500">등록된 상세 콘텐츠가 없습니다. 수정 페이지에서 AI 생성 또는 직접 입력 후 저장해 주세요.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
