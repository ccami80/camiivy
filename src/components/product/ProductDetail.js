'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import ProductGallery from './ProductGallery';
import ProductInfo from './ProductInfo';
import ProductDetailTemplateA from './ProductDetailTemplateA';
import ProductDetailTemplateB from './ProductDetailTemplateB';
import ProductDetailTemplateC from './ProductDetailTemplateC';
import ReviewSection from './ReviewSection';
import RecommendedProducts from './RecommendedProducts';
import CategoryBestProducts from './CategoryBestProducts';
import { useSelector, useDispatch } from 'react-redux';
import { addRecentlyViewedItem } from '@/redux/reducers/recentlyViewedReducer';
import { toggleWishlistItem } from '@/redux/reducers/wishlistReducer';
import { wishlistEntryFromProduct } from '@/lib/wishlistHelpers';

const TEMPLATES = [
  { id: 'A', label: '프리미엄' },
  { id: 'B', label: '기능/사이즈' },
  { id: 'C', label: '스토리' },
];

const PARTNER_TOKEN_KEY = 'partnerToken';
const BRAND_LABEL = { CAMI: '까미', IVY: '아이비' };

function parseOptionString(str) {
  if (!str || typeof str !== 'string') return [];
  return str.split(/[,/]/).map((s) => s.trim()).filter(Boolean);
}

export default function ProductDetail({ productId }) {
  const [activeTemplate, setActiveTemplate] = useState('A');
  const [activeTabId, setActiveTabId] = useState('section-product-detail');
  const [product, setProduct] = useState(null);
  const [reviewSummary, setReviewSummary] = useState({ average: null, count: 0 });
  const [loading, setLoading] = useState(!!productId);
  const [error, setError] = useState('');
  const [inquiryModalOpen, setInquiryModalOpen] = useState(false);
  const [inquiryForm, setInquiryForm] = useState({ title: '', content: '', emailReply: false, secret: false });
  const [inquirySubmitting, setInquirySubmitting] = useState(false);
  const [inquiries, setInquiries] = useState([]);
  const [inquiriesLoading, setInquiriesLoading] = useState(false);
  const wishlistItems = useSelector((state) => state.wishlist.items);
  const dispatch = useDispatch();
  const isWishlisted = product?.id && wishlistItems.some((p) => p.id === String(product.id));
  const tabBarRef = useRef(null);
  const [isTabBarSticky, setIsTabBarSticky] = useState(false);
  const [tabBarHeight, setTabBarHeight] = useState(44);

  useEffect(() => {
    if (!productId) {
      setLoading(false);
      return;
    }
    const token = typeof window !== 'undefined' ? localStorage.getItem(PARTNER_TOKEN_KEY) : null;
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    fetch(`/api/products/${productId}`, { headers })
      .then((r) => {
        if (!r.ok) {
          if (r.status === 404) throw new Error('상품을 찾을 수 없습니다.');
          throw new Error('로드 실패');
        }
        return r.json();
      })
      .then(setProduct)
      .catch((err) => setError(err.message || '상품을 불러올 수 없습니다.'))
      .finally(() => setLoading(false));
  }, [productId]);

  useEffect(() => {
    if (!productId) return;
    fetch(`/api/products/${productId}/reviews`)
      .then((r) => (r.ok ? r.json() : { reviews: [] }))
      .then((data) => {
        const list = data.reviews || [];
        if (list.length === 0) {
          setReviewSummary({ average: null, count: 0 });
          return;
        }
        const sum = list.reduce((a, r) => a + (r.rating || 0), 0);
        setReviewSummary({ average: sum / list.length, count: list.length });
      })
      .catch(() => setReviewSummary({ average: null, count: 0 }));
  }, [productId]);

  const loadInquiries = useCallback(() => {
    if (!product?.id) return;
    setInquiriesLoading(true);
    fetch(`/api/products/${product.id}/inquiries`)
      .then((r) => (r.ok ? r.json() : { inquiries: [] }))
      .then((data) => setInquiries(data.inquiries || []))
      .catch(() => setInquiries([]))
      .finally(() => setInquiriesLoading(false));
  }, [product?.id]);

  useEffect(() => {
    if (product?.id) loadInquiries();
  }, [product?.id, loadInquiries]);

  useEffect(() => {
    if (!product?.id) return;
    const entry = product?.id
      ? { id: String(product.id), name: product.name || '', imageUrl: (product.images?.[0] || product.images?.find?.((i) => i.type === 'main'))?.url ?? null }
      : null;
    if (entry) dispatch(addRecentlyViewedItem(entry));
    // 의존성에 dispatch 제외 (안정적 참조)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.id]);

  useEffect(() => {
    const el = tabBarRef.current;
    if (!el) return;
    const measure = () => setTabBarHeight(el.getBoundingClientRect().height);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [product?.id]);

  useEffect(() => {
    const handleScroll = () => {
      const el = tabBarRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      setIsTabBarSticky(rect.top <= 0);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [product?.id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 text-center">
        <p className="text-gray-500">로딩 중…</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 text-center">
        <p className="text-gray-600">{error || '상품을 찾을 수 없습니다.'}</p>
        <Link href="/products" className="mt-4 inline-block text-sm text-gray-600 hover:text-gray-900">
          상품 목록으로
        </Link>
      </div>
    );
  }

  const mainImages = (product.images || []).filter((i) => i.type === 'main').sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  const imageUrls = mainImages.length > 0 ? mainImages.map((i) => i.url) : (product.images || []).map((i) => i.url).filter(Boolean);
  const detailImages = (product.images || []).filter((i) => i.type === 'detail').sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  const sizeOptions = parseOptionString(product.sizeOption);
  const colorOptions = parseOptionString(product.colorOption);
  const hasDetailContent = product.detailContent && product.detailContent.trim();
  const hasDetailImages = detailImages.length > 0;
  const brandName = BRAND_LABEL[product.brand] || product.brand;
  const categoryName = product.category?.name || '';

  function scrollToReviews() {
    const el = document.getElementById('section-reviews');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  const TAB_SECTIONS = [
    { id: 'section-product-detail', label: '상품 설명' },
    { id: 'section-inquiry', label: '상품 문의', count: inquiries.length },
    { id: 'section-reviews', label: '상품 후기', count: reviewSummary.count },
    { id: 'section-shipping', label: '배송/교환/환불' },
  ];

  function scrollToSection(sectionId) {
    setActiveTabId(sectionId);
    const el = document.getElementById(sectionId);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function renderTabList(extraUlClass = '') {
    return (
      <ul className={`flex list-none items-center text-sm ${extraUlClass}`.trim()} role="tablist" aria-label="상품 상세 탭">
        {TAB_SECTIONS.map((tab, index) => {
          const isActive = activeTabId === tab.id;
          return (
            <li
              key={tab.id}
              role="presentation"
              className={
                isActive
                  ? '-mb-px border border-b-0 border-black bg-white px-6 py-3'
                  : `px-6 py-3 text-gray-600 ${index > 0 ? 'border-l border-gray-300' : ''}`
              }
            >
              <button
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => scrollToSection(tab.id)}
                className={`focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 ${isActive ? 'font-semibold text-red-500' : 'hover:text-gray-900'}`}
              >
                {tab.label}
                {tab.count != null ? ` (${tab.count})` : ''}
              </button>
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-4 md:py-8">
      <article>
        {/* 브레드크럼 (전체 페이지와 동일 위치·스타일) */}
        <div className="pb-6">
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex flex-wrap items-center gap-1 text-sm">
              <li>
                <Link href="/" className="text-gray-400 hover:text-gray-600">
                  HOME
                </Link>
              </li>
              {brandName && (
                <>
                  <li className="text-gray-400" aria-hidden> &gt; </li>
                  <li>
                    <Link
                      href={`/products?brand=${product.brand}&petType=${product.petType}`}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {brandName}
                    </Link>
                  </li>
                </>
              )}
              {categoryName && (
                <>
                  <li className="text-gray-400" aria-hidden> &gt; </li>
                  <li>
                    <span className="font-semibold text-gray-900 underline underline-offset-2">
                      {categoryName}
                    </span>
                  </li>
                </>
              )}
              {!categoryName && (
                <>
                  <li className="text-gray-400" aria-hidden> &gt; </li>
                  <li>
                    <span className="font-semibold text-gray-900 underline underline-offset-2 line-clamp-1">
                      {product.name}
                    </span>
                  </li>
                </>
              )}
            </ol>
          </nav>
        </div>
        <div className="flex items-center justify-end gap-2 border-b border-gray-100 pb-4">
            <button
              type="button"
              onClick={() => dispatch(toggleWishlistItem(wishlistEntryFromProduct(product) || { id: product.id, name: product.name, imageUrl: null, basePrice: product.basePrice }))}
              className="rounded p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
              aria-label={isWishlisted ? '찜 해제' : '찜하기'}
            >
              <svg
                className={`h-5 w-5 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`}
                fill={isWishlisted ? 'currentColor' : 'none'}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
            <button type="button" className="rounded p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700" aria-label="공유">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </button>
        </div>

        <div className="grid gap-10 md:grid-cols-2 md:gap-12">
          <ProductGallery images={imageUrls.length > 0 ? imageUrls : undefined} />
          <div className="flex flex-col">
            <ProductInfo
              productId={product.id}
              name={product.name}
              price={product.basePrice ?? 0}
              sizeOptions={sizeOptions}
              colorOptions={colorOptions}
              stock={product.totalStock != null ? product.totalStock : 99}
              variants={product.variants ?? []}
              rating={reviewSummary.average}
              reviewCount={reviewSummary.count}
              onReviewClick={scrollToReviews}
              shippingPeriod={product.shippingPeriod || product.shippingMethod || null}
              shippingFee={product.shippingFee}
            />
          </div>
        </div>

        {/* 탭: 스크롤 시 상단 고정 (스크롤 감지 + fixed) */}
        {isTabBarSticky && (
          <div
            className="fixed left-0 right-0 top-[52px] z-10 border-b border-gray-300 bg-gray-50"
            id="lyrPrdTabLink-fixed"
            style={{ paddingLeft: 'max(1rem, env(safe-area-inset-left))', paddingRight: 'max(1rem, env(safe-area-inset-right))' }}
          >
            <div className="mx-auto max-w-6xl">
              {renderTabList()}
            </div>
          </div>
        )}
        <div
          ref={tabBarRef}
          className={`mt-16 border-b border-gray-300 bg-gray-50 ${isTabBarSticky ? 'invisible' : ''}`}
          id="lyrPrdTabLink"
          style={isTabBarSticky ? { height: tabBarHeight } : undefined}
        >
          {renderTabList()}
        </div>

        <div className="mt-10 md:mt-12">
          <section id="section-product-detail" className="scroll-mt-24">
            <div className="mt-20 md:mt-28">
          {hasDetailImages && (
            <section className="mb-12">
              <h2 className="mb-6 text-sm font-semibold uppercase tracking-wider text-gray-500">상세 이미지</h2>
              <div className="space-y-4">
                {detailImages.map((img) => (
                  <div key={img.id} className="overflow-hidden rounded-lg bg-gray-50">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.url}
                      alt=""
                      className="w-full object-contain"
                    />
                  </div>
                ))}
              </div>
            </section>
          )}
          {hasDetailContent && (
            <>
              <h2 className="mb-6 text-sm font-semibold uppercase tracking-wider text-gray-500">상세 설명</h2>
              <div
                className="prose prose-sm max-w-none prose-img:rounded-lg"
                dangerouslySetInnerHTML={{ __html: product.detailContent }}
              />
            </>
          )}
          {!hasDetailImages && !hasDetailContent && (
            <>
              <div className="mb-10 flex flex-wrap gap-2 border-b border-gray-100 pb-4">
                <span className="mr-2 text-xs font-medium uppercase tracking-wider text-gray-400">상세 보기</span>
                {TEMPLATES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setActiveTemplate(t.id)}
                    className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                      activeTemplate === t.id
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              {activeTemplate === 'A' && <ProductDetailTemplateA />}
              {activeTemplate === 'B' && <ProductDetailTemplateB />}
              {activeTemplate === 'C' && <ProductDetailTemplateC />}
            </>
          )}
            </div>
          </section>

          <section id="section-inquiry" className="scroll-mt-24 border-t border-gray-100 pt-12">
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-gray-500">상품문의</h2>
            <p className="mb-4 text-xs text-gray-500">답변은 마이페이지 &gt; 나의 문의내역에서 확인하실 수 있습니다.</p>
            <button
              type="button"
              onClick={() => setInquiryModalOpen(true)}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
            >
              문의하기
            </button>
            {inquiriesLoading ? (
              <p className="mt-6 text-sm text-gray-500">문의 목록을 불러오는 중…</p>
            ) : inquiries.length === 0 ? (
              <p className="mt-6 text-sm text-gray-500">등록된 상품 문의가 없습니다.</p>
            ) : (
              <ul className="mt-6 space-y-4">
                {inquiries.map((inq) => (
                  <li key={inq.id} className="rounded-lg border border-gray-100 bg-white p-4">
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <span className="font-medium text-gray-900">{inq.title}</span>
                      <span className="text-gray-500">{inq.writerName}</span>
                      <span className="text-gray-400">{new Date(inq.createdAt).toLocaleDateString('ko-KR')}</span>
                      {inq.secret && <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600">비밀글</span>}
                    </div>
                    <p className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">{inq.maskedContent ? '비밀글입니다.' : inq.content}</p>
                    {inq.answer && (
                      <div className="mt-3 border-t border-gray-100 pt-3">
                        <p className="text-xs font-medium text-gray-500">답변</p>
                        <p className="mt-1 text-sm text-gray-800 whitespace-pre-wrap">{inq.answer}</p>
                        {inq.answeredAt && <p className="mt-1 text-xs text-gray-400">{new Date(inq.answeredAt).toLocaleDateString('ko-KR')}</p>}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section id="section-reviews" className="scroll-mt-24 border-t border-gray-100 pt-12">
            <ReviewSection productId={product.id} />
          </section>

          <section id="section-shipping" className="scroll-mt-24 border-t border-gray-100 pt-12">
            <h2 className="mb-6 text-sm font-semibold uppercase tracking-wider text-gray-500">배송/교환/환불</h2>

            <div className="space-y-8 text-sm text-gray-700">
              <div>
                <h3 className="mb-2 font-semibold text-gray-900">배송 안내</h3>
                <ul className="list-inside list-disc space-y-1 text-gray-600">
                  <li>배송 기간: 결제 완료(입금 확인) 후 1~3일 이내 출고, 도착까지 2~5일 소요됩니다.</li>
                  <li>제주·도서산간 지역은 1~2일 추가 소요될 수 있습니다.</li>
                  <li>배송비는 상품/주문 금액에 따라 상이하며, 상품 페이지에서 확인 가능합니다.</li>
                  <li>일부 상품은 재고/제작 일정에 따라 배송일이 다를 수 있습니다.</li>
                </ul>
              </div>

              <div>
                <h3 className="mb-2 font-semibold text-gray-900">교환/반품 안내</h3>
                <ul className="list-inside list-disc space-y-1 text-gray-600">
                  <li>수령일로부터 7일 이내, 미개봉·미사용 시에만 교환/반품이 가능합니다.</li>
                  <li>단순 변심: 왕복 배송비는 고객 부담이며, 반품 시 배송비를 차감한 금액이 환불됩니다.</li>
                  <li>상품 불량·오배송: 배송비 부담 없이 교환/반품 가능하며, 전액 환불 또는 재발송 해드립니다.</li>
                  <li>교환은 동일 상품·동일 옵션으로만 가능하며, 옵션 변경 시 반품 후 재주문해 주세요.</li>
                </ul>
              </div>

              <div>
                <h3 className="mb-2 font-semibold text-gray-900">주의사항</h3>
                <ul className="list-inside list-disc space-y-1 text-gray-600">
                  <li>포장을 개봉한 경우, 상품 하자나 오배송이 아닐 때는 교환/반품이 제한될 수 있습니다.</li>
                  <li>반려동물 식품·음료, 밀봉 포장 상품 등은 상품 성격상 단순 변심 반품이 불가할 수 있습니다.</li>
                  <li>교환/반품 신청은 마이페이지 또는 고객센터를 이용해 주세요.</li>
                </ul>
              </div>

              <div>
                <h3 className="mb-2 font-semibold text-gray-900">A/S 안내</h3>
                <ul className="list-inside list-disc space-y-1 text-gray-600">
                  <li>정상 사용 중 제품 불량이 발생한 경우, 구매일로부터 보증 기간 내 무상 A/S를 진행합니다.</li>
                  <li>A/S 문의: 고객센터 또는 마이페이지 1:1 문의를 이용해 주시면 안내해 드립니다.</li>
                  <li>상품별 보증 기간과 A/S 조건은 상세페이지 또는 별도 고지에 따릅니다.</li>
                </ul>
              </div>

              <div>
                <h3 className="mb-3 font-semibold text-gray-900">판매자 정보</h3>
                <div className="overflow-hidden border border-gray-200 text-sm">
                  <table className="w-full table-fixed border-collapse">
                    <tbody className="text-gray-700">
                      <tr className="border-b border-gray-200">
                        <th className="w-32 shrink-0 border-b border-gray-200 bg-gray-50 px-4 py-3 text-left font-medium text-gray-600">판매자</th>
                        <td className="border-b border-gray-200 px-4 py-3">까미&아이비</td>
                      </tr>
                      <tr className="border-b border-gray-200">
                        <th className="bg-gray-50 px-4 py-3 text-left font-medium text-gray-600">사업자등록번호</th>
                        <td className="px-4 py-3">000-00-00000</td>
                      </tr>
                      <tr className="border-b border-gray-200">
                        <th className="bg-gray-50 px-4 py-3 text-left font-medium text-gray-600">통신판매업 신고</th>
                        <td className="px-4 py-3">제0000-서울○○-0000호</td>
                      </tr>
                      <tr className="border-b border-gray-200">
                        <th className="bg-gray-50 px-4 py-3 text-left font-medium text-gray-600">대표자명</th>
                        <td className="px-4 py-3">○○○</td>
                      </tr>
                      <tr className="border-b border-gray-200">
                        <th className="bg-gray-50 px-4 py-3 text-left font-medium text-gray-600">주소</th>
                        <td className="px-4 py-3">서울특별시 ○○구 ○○로 000</td>
                      </tr>
                      <tr>
                        <th className="bg-gray-50 px-4 py-3 text-left font-medium text-gray-600">연락처</th>
                        <td className="px-4 py-3">0000-0000</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </section>
        </div>

        <RecommendedProducts productId={product.id} />
        <CategoryBestProducts productId={product.id} />

        {/* 상품문의 모달 (롯데ON Q&A 문의하기 참고) */}
        {inquiryModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="inquiry-modal-title"
            onClick={(e) => e.target === e.currentTarget && setInquiryModalOpen(false)}
          >
            <div className="w-full max-w-lg rounded-lg bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
              <div className="border-b border-gray-200 px-6 py-4">
                <h2 id="inquiry-modal-title" className="text-lg font-semibold text-gray-900">상품문의</h2>
              </div>
              <form
                className="px-6 py-4"
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!inquiryForm.title.trim() || !inquiryForm.content.trim()) {
                    alert('제목과 내용을 입력해 주세요.');
                    return;
                  }
                  if (!product?.id) return;
                  setInquirySubmitting(true);
                  try {
                    const token = typeof window !== 'undefined' ? localStorage.getItem('userToken') : null;
                    const res = await fetch(`/api/products/${product.id}/inquiries`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
                      body: JSON.stringify({
                        title: inquiryForm.title.trim(),
                        content: inquiryForm.content.trim(),
                        emailReply: inquiryForm.emailReply,
                        secret: inquiryForm.secret,
                      }),
                    });
                    let data = {};
                    try {
                      const text = await res.text();
                      if (text) data = JSON.parse(text);
                    } catch (_) {
                      data = { error: '응답을 확인할 수 없습니다.' };
                    }
                    if (!res.ok) {
                      alert(data.error || `문의 등록에 실패했습니다. (${res.status})`);
                      return;
                    }
                    setInquiryModalOpen(false);
                    setInquiryForm({ title: '', content: '', emailReply: false, secret: false });
                    loadInquiries();
                    alert('문의가 등록되었습니다. 답변은 마이페이지에서 확인해 주세요.');
                  } catch (err) {
                    alert(err?.message || '문의 등록에 실패했습니다.');
                  } finally {
                    setInquirySubmitting(false);
                  }
                }}
              >
                <div className="space-y-4">
                  <div>
                    <label htmlFor="inquiry-title" className="mb-1 block text-sm font-medium text-gray-700">제목</label>
                    <input
                      id="inquiry-title"
                      type="text"
                      value={inquiryForm.title}
                      onChange={(e) => setInquiryForm((f) => ({ ...f, title: e.target.value }))}
                      placeholder="제목을 입력하세요"
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
                      maxLength={100}
                    />
                  </div>
                  <div>
                    <label htmlFor="inquiry-content" className="mb-1 block text-sm font-medium text-gray-700">내용</label>
                    <textarea
                      id="inquiry-content"
                      value={inquiryForm.content}
                      onChange={(e) => setInquiryForm((f) => ({ ...f, content: e.target.value }))}
                      placeholder="문의 내용을 입력하세요"
                      rows={5}
                      className="w-full resize-y rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={inquiryForm.emailReply}
                        onChange={(e) => setInquiryForm((f) => ({ ...f, emailReply: e.target.checked }))}
                        className="rounded border-gray-300"
                      />
                      이메일 답변 받기
                    </label>
                    <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={inquiryForm.secret}
                        onChange={(e) => setInquiryForm((f) => ({ ...f, secret: e.target.checked }))}
                        className="rounded border-gray-300"
                      />
                      비밀글로 문의하기
                    </label>
                  </div>
                  <ul className="rounded bg-gray-50 px-4 py-3 text-xs text-gray-600">
                    <li>· 주문 후 주문/배송/취소 등에 관한 문의는 마이페이지 &gt; 1:1 상담을 이용해 주세요.</li>
                    <li>· 작성하신 문의 및 답변은 마이페이지 &gt; 상품 문의에서 확인할 수 있습니다.</li>
                    <li>· 상품과 관련 없는 문의는 삭제될 수 있습니다.</li>
                  </ul>
                </div>
                <div className="mt-6 flex justify-end gap-2 border-t border-gray-100 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setInquiryModalOpen(false);
                      setInquiryForm({ title: '', content: '', emailReply: false, secret: false });
                    }}
                    className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    disabled={inquirySubmitting}
                    className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-60"
                  >
                    {inquirySubmitting ? '등록 중…' : '등록'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </article>
    </div>
  );
}
