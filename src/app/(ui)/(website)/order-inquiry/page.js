'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';

const TABS = [
  { key: 'notice', label: '공지사항' },
  { key: 'faq', label: 'FAQ' },
  { key: 'one-to-one', label: '1:1 문의' },
  { key: 'inquiry-history', label: '문의내역' },
  { key: 'guest-order', label: '비회원 주문 조회' },
];

const FAQ_CATEGORIES = [
  { key: 'order', label: '주문/결제' },
  { key: 'delivery', label: '배송' },
  { key: 'cancel', label: '취소/교환/반품' },
  { key: 'account', label: '회원/로그인' },
  { key: 'etc', label: '기타' },
];

const INQUIRY_TYPES = [
  { key: '취소/환불', label: '취소/환불' },
  { key: '배송', label: '배송' },
  { key: '교환/반품', label: '교환/반품' },
  { key: '상품', label: '상품' },
  { key: '회원/로그인', label: '회원/로그인' },
  { key: '기타', label: '기타' },
];

const INQUIRY_TYPES_REQUIRE_ORDER = ['취소/환불', '배송', '교환/반품', '상품'];

const MAX_CONTENT = 4000;
const USER_TOKEN_KEY = 'userToken';

function getUserToken() {
  return typeof window !== 'undefined' ? localStorage.getItem(USER_TOKEN_KEY) : null;
}

/** 마크다운에서 ] (url) 처럼 공백이 있는 링크를 ](url) 로 정규화해 링크로 렌더되게 함 */
function normalizeMarkdownLinks(text) {
  if (typeof text !== 'string') return '';
  return text.replace(/\]\s+\((https?:\/\/[^\s)]+)\)/g, ']($1)');
}

export default function CustomerCenterPage() {
  const [tab, setTab] = useState('notice');
  const [faqCategory, setFaqCategory] = useState('all');
  const [openFaqId, setOpenFaqId] = useState(null);
  const [notices, setNotices] = useState([]);
  const [faqList, setFaqList] = useState([]);
  const [loadingNotice, setLoadingNotice] = useState(true);
  const [loadingFaq, setLoadingFaq] = useState(true);
  const [oneToOneSettings, setOneToOneSettings] = useState(null);

  // 1:1 문의 폼
  const [inquiryType, setInquiryType] = useState('');
  const [content, setContent] = useState('');
  const [imageUrls, setImageUrls] = useState([]);
  const [notifySms, setNotifySms] = useState(true);
  const [notifyEmail, setNotifyEmail] = useState(false);
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [inquirySubmitting, setInquirySubmitting] = useState(false);
  const [inquiryError, setInquiryError] = useState('');
  const [imageUploading, setImageUploading] = useState(false);
  const inquiryImageInputRef = useRef(null);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderLookupNumber, setOrderLookupNumber] = useState('');
  const [orderLookupPhone, setOrderLookupPhone] = useState('');
  const [orderLookupLoading, setOrderLookupLoading] = useState(false);
  const [orderLookupError, setOrderLookupError] = useState('');
  const requiresOrder = INQUIRY_TYPES_REQUIRE_ORDER.includes(inquiryType);

  // 문의내역 (로그인 회원)
  const [inquiryHistory, setInquiryHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState('');
  const [expandedHistoryId, setExpandedHistoryId] = useState(null);
  const HISTORY_PREVIEW_LEN = 50;

  useEffect(() => {
    fetch('/api/notices')
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setNotices(Array.isArray(data) ? data : []))
      .catch(() => setNotices([]))
      .finally(() => setLoadingNotice(false));
  }, []);

  useEffect(() => {
    fetch('/api/faq')
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setFaqList(Array.isArray(data) ? data : []))
      .catch(() => setFaqList([]))
      .finally(() => setLoadingFaq(false));
  }, []);

  useEffect(() => {
    fetch('/api/customer-center/settings')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setOneToOneSettings(data || {}))
      .catch(() => setOneToOneSettings({}));
  }, []);

  function fetchMyInquiryHistory() {
    const token = getUserToken();
    if (!token) return;
    setHistoryLoading(true);
    setHistoryError('');
    fetch('/api/inquiry/my', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setInquiryHistory(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        setHistoryError(err.message || '조회에 실패했습니다.');
        setInquiryHistory([]);
      })
      .finally(() => setHistoryLoading(false));
  }

  useEffect(() => {
    if (tab === 'inquiry-history' && getUserToken()) {
      fetchMyInquiryHistory();
    }
  }, [tab]);

  function handleInquiryImageChange(e) {
    const files = e.target.files;
    if (!files?.length) return;
    const remaining = 3 - imageUrls.length;
    if (remaining <= 0) return;
    const toAdd = Array.from(files).slice(0, remaining);
    setImageUploading(true);
    setInquiryError('');
    const formData = new FormData();
    toAdd.forEach((f) => formData.append('files', f));
    fetch('/api/inquiry/upload', { method: 'POST', body: formData })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setImageUrls((prev) => [...prev, ...(data.urls || [])].slice(0, 3));
      })
      .catch((err) => setInquiryError(err.message || '이미지 업로드에 실패했습니다.'))
      .finally(() => {
        setImageUploading(false);
        e.target.value = '';
      });
  }

  function handleOrderLookup() {
    setOrderLookupError('');
    if (!orderLookupNumber.trim() || !orderLookupPhone.trim()) {
      setOrderLookupError('주문번호와 휴대폰 번호를 입력해 주세요.');
      return;
    }
    setOrderLookupLoading(true);
    fetch(
      `/api/orders/lookup?orderNumber=${encodeURIComponent(orderLookupNumber.trim())}&phone=${encodeURIComponent(orderLookupPhone.trim())}`
    )
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setSelectedOrder({
          id: data.id,
          orderNumber: data.orderNumber,
          createdAt: data.createdAt,
          itemSummary: data.itemSummary,
        });
      })
      .catch((err) => setOrderLookupError(err.message || '주문을 찾을 수 없습니다.'))
      .finally(() => setOrderLookupLoading(false));
  }

  function handleInquirySubmit(e) {
    e.preventDefault();
    setInquiryError('');
    if (!inquiryType?.trim()) {
      setInquiryError('문의유형을 선택해 주세요.');
      return;
    }
    if (requiresOrder && !selectedOrder) {
      setInquiryError('① 문의하실 주문정보를 선택해 주세요.');
      return;
    }
    if (!content?.trim()) {
      setInquiryError('문의 내용을 입력해 주세요.');
      return;
    }
    if (content.length > MAX_CONTENT) {
      setInquiryError(`문의 내용은 ${MAX_CONTENT}자 이하여야 합니다.`);
      return;
    }
    setInquirySubmitting(true);
    const token = getUserToken();
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers.Authorization = `Bearer ${token}`;
    fetch('/api/inquiry', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        inquiryType: inquiryType.trim(),
        orderId: selectedOrder?.id ?? null,
        orderNumber: selectedOrder?.orderNumber ?? null,
        orderPhone: requiresOrder && orderLookupPhone.trim() ? orderLookupPhone.trim() : null,
        content: content.trim(),
        imageUrls,
        notifySms,
        notifyEmail,
        phone: phone.trim() || null,
        email: email.trim() || null,
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        alert('문의가 등록되었습니다. 답변은 입력하신 연락처로 안내드리겠습니다.');
        setInquiryType('');
        setContent('');
        setImageUrls([]);
        setPhone('');
        setEmail('');
        setSelectedOrder(null);
        setOrderLookupNumber('');
        setOrderLookupPhone('');
        if (token) fetchMyInquiryHistory();
      })
      .catch((err) => setInquiryError(err.message || '등록에 실패했습니다.'))
      .finally(() => setInquirySubmitting(false));
  }

  function formatHistoryDate(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
  }

  const filteredFaq =
    faqCategory === 'all'
      ? faqList
      : faqList.filter((f) => f.category === faqCategory);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 md:px-6">
      <h1 className="text-2xl font-bold text-gray-900">고객센터</h1>
      <p className="mt-1 text-sm text-gray-500">
        공지사항, 자주 묻는 질문, 1:1 문의, 문의내역, 비회원 주문 조회를 이용할 수 있습니다.
      </p>

      <nav className="mt-8 border-b border-gray-200" aria-label="고객센터 메뉴">
        <ul className="flex gap-0">
          {TABS.map(({ key, label }) => (
            <li key={key}>
              <button
                type="button"
                onClick={() => setTab(key)}
                className={`border-b-2 px-6 py-4 text-sm font-medium transition ${
                  tab === key
                    ? 'border-gray-900 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                {label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {tab === 'notice' && (
        <section className="py-8" aria-label="공지사항">
          {loadingNotice ? (
            <p className="text-center text-gray-500">로딩 중…</p>
          ) : notices.length === 0 ? (
            <p className="rounded-lg border border-gray-200 bg-white py-12 text-center text-sm text-gray-500">
              등록된 공지사항이 없습니다.
            </p>
          ) : (
            <ul className="divide-y divide-gray-200 border border-gray-200 bg-white">
              {notices.map((n) => (
                <li key={n.id}>
                  <div className="flex items-center gap-4 px-4 py-4 sm:px-6">
                    <span className="shrink-0 rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                      {n.type}
                    </span>
                    <span className="min-w-0 flex-1 text-sm font-medium text-gray-900">
                      {n.title}
                    </span>
                    <span className="shrink-0 text-xs text-gray-500">
                      {n.date || (n.createdAt && n.createdAt.slice(0, 10))}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-4 text-center text-sm text-gray-500">
            공지사항 상세·목록 더보기는 추후 게시판 연동 시 제공됩니다.
          </p>
        </section>
      )}

      {tab === 'faq' && (
        <section className="py-8" aria-label="자주 묻는 질문">
          <div className="mb-6">
            <p className="mb-3 text-sm font-medium text-gray-700">카테고리</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setFaqCategory('all')}
                className={`rounded-full px-4 py-2 text-sm ${
                  faqCategory === 'all'
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                전체
              </button>
              {FAQ_CATEGORIES.map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setFaqCategory(key)}
                  className={`rounded-full px-4 py-2 text-sm ${
                    faqCategory === key
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          {loadingFaq ? (
            <p className="text-center text-gray-500">로딩 중…</p>
          ) : filteredFaq.length === 0 ? (
            <p className="rounded-lg border border-gray-200 bg-white py-12 text-center text-sm text-gray-500">
              등록된 FAQ가 없습니다.
            </p>
          ) : (
            <ul className="border border-gray-200 bg-white">
              {filteredFaq.map((item) => {
                const isOpen = openFaqId === item.id;
                return (
                  <li key={item.id} className="border-b border-gray-100 last:border-b-0">
                    <button
                      type="button"
                      onClick={() => setOpenFaqId(isOpen ? null : item.id)}
                      className="flex w-full items-start justify-between gap-4 px-4 py-4 text-left hover:bg-gray-50 sm:px-6"
                      aria-expanded={isOpen}
                    >
                      <span className="text-sm font-medium text-gray-900">
                        Q. {item.question}
                      </span>
                      <span
                        className={`shrink-0 text-gray-400 transition ${isOpen ? 'rotate-180' : ''}`}
                        aria-hidden
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </span>
                    </button>
                    {isOpen && (
                      <div className="border-t border-gray-100 bg-gray-50 px-4 py-4 sm:px-6">
                        <div className="faq-answer text-sm leading-relaxed text-gray-700 [&_a]:text-blue-600 [&_a]:underline hover:[&_a]:text-blue-800 [&_img]:max-h-64 [&_img]:rounded-lg [&_p]:mb-2 [&_p:last-child]:mb-0">
                          <ReactMarkdown
                            components={{
                              a: ({ href, children, ...props }) => (
                                <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
                                  {children}
                                </a>
                              ),
                              img: ({ src, alt, ...props }) => (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={src} alt={alt || ''} className="max-h-64 rounded-lg" {...props} />
                              ),
                            }}
                          >
                            {normalizeMarkdownLinks(item.answer)}
                          </ReactMarkdown>
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      )}

      {tab === 'one-to-one' && (
        <section className="py-8" aria-label="1:1 문의">
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900">1:1 문의하기</h2>
            <div className="mt-3 rounded-lg bg-gray-100 px-4 py-3 text-sm text-gray-700">
              오후 4시 이후 접수 건은 다음날 (평일) 오전 9시 이후 답변드리겠습니다.
            </div>

            <form onSubmit={handleInquirySubmit} className="mt-6 space-y-6">
                {inquiryError && (
                  <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{inquiryError}</p>
                )}

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <label className="w-28 shrink-0 text-sm font-medium text-gray-700">문의유형</label>
                  <div className="flex-1">
                    <select
                      value={inquiryType}
                      onChange={(e) => {
                        setInquiryType(e.target.value);
                        if (!INQUIRY_TYPES_REQUIRE_ORDER.includes(e.target.value)) setSelectedOrder(null);
                      }}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
                      required
                    >
                      <option value="">문의유형 선택</option>
                      {INQUIRY_TYPES.map((t) => (
                        <option key={t.key} value={t.key}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {requiresOrder && (
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
                    <label className="w-28 shrink-0 pt-2 text-sm font-medium text-gray-700">주문정보</label>
                    <div className="flex-1 space-y-2">
                      {selectedOrder ? (
                        <div className="flex items-center justify-between rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm">
                          <span className="text-gray-800">
                            주문번호 {selectedOrder.orderNumber}
                            {selectedOrder.itemSummary && (
                              <span className="ml-2 text-gray-500">({selectedOrder.itemSummary})</span>
                            )}
                          </span>
                          <button
                            type="button"
                            onClick={() => setSelectedOrder(null)}
                            className="text-gray-500 hover:text-gray-700 underline"
                          >
                            변경
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="flex flex-wrap items-end gap-2">
                            <div className="min-w-[140px] flex-1">
                              <input
                                type="text"
                                value={orderLookupNumber}
                                onChange={(e) => setOrderLookupNumber(e.target.value)}
                                placeholder="주문번호"
                                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                              />
                            </div>
                            <div className="min-w-[140px] flex-1">
                              <input
                                type="tel"
                                value={orderLookupPhone}
                                onChange={(e) => setOrderLookupPhone(e.target.value)}
                                placeholder="수령인 휴대폰 번호"
                                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={handleOrderLookup}
                              disabled={orderLookupLoading}
                              className="shrink-0 rounded-md border border-gray-700 bg-gray-700 px-4 py-2 text-sm font-medium text-white hover:bg-gray-600 disabled:opacity-50"
                            >
                              {orderLookupLoading ? '조회 중…' : '주문 조회'}
                            </button>
                          </div>
                          {orderLookupError && (
                            <p className="text-sm text-red-600">{orderLookupError}</p>
                          )}
                        </>
                      )}
                      {!selectedOrder && (
                        <p className="text-sm text-red-600">① 문의하실 주문정보를 선택해 주세요.</p>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
                  <label className="w-28 shrink-0 pt-2 text-sm font-medium text-gray-700">문의내용</label>
                  <div className="flex-1">
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value.slice(0, MAX_CONTENT))}
                      placeholder="문의 내용을 입력해 주세요. 문의 내용을 상세히 기재해 주시면 보다 정확하고 빠르게 답변드리겠습니다."
                      className="min-h-[160px] w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
                      required
                    />
                    <p className="mt-1 text-right text-xs text-gray-500">{content.length}/{MAX_CONTENT}</p>
                  </div>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
                  <div className="w-28 shrink-0">
                    <span className="text-sm font-medium text-gray-700">사진첨부</span>
                    <span className="block text-xs text-gray-500">(선택사항)</span>
                  </div>
                  <div className="flex-1">
                    <input
                      ref={inquiryImageInputRef}
                      type="file"
                      accept="image/jpeg,image/png"
                      className="hidden"
                      onChange={handleInquiryImageChange}
                    />
                    <div className="flex gap-2">
                      {[0, 1, 2].map((i) => (
                        <div key={i} className="flex h-24 w-24 shrink-0 flex-col items-center justify-center rounded-lg border border-gray-200 bg-gray-50">
                          {imageUrls[i] ? (
                            <div className="relative h-full w-full">
                              <img src={imageUrls[i]} alt="" className="h-full w-full object-cover rounded-lg" />
                              <button
                                type="button"
                                onClick={() => setImageUrls((prev) => prev.filter((_, j) => j !== i))}
                                className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
                                aria-label="삭제"
                              >
                                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              disabled={imageUploading || imageUrls.length >= 3}
                              onClick={() => inquiryImageInputRef.current?.click()}
                              className="flex flex-col items-center justify-center text-gray-400 hover:text-gray-600 disabled:opacity-50"
                            >
                              <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /></svg>
                              <span className="mt-1 text-xs">추가</span>
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    <ul className="mt-2 list-inside list-disc text-xs text-gray-500">
                      <li>사진 첨부는 5MB 미만의 jpg, png 파일만 등록 가능하며, 최대 3개까지 등록 가능합니다.</li>
                      <li>개인정보 관련 피해 방지를 위해 이름, 연락처, 주소 등 개인정보가 노출되지 않도록 주의해주시기 바랍니다.</li>
                    </ul>
                  </div>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
                  <label className="w-28 shrink-0 pt-2 text-sm font-medium text-gray-700">답변알림</label>
                  <div className="flex-1 space-y-3">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" checked={notifySms} onChange={(e) => setNotifySms(e.target.checked)} className="rounded border-gray-300" />
                      <span className="text-sm text-gray-700">문자/알림톡</span>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="010-0000-0000"
                        className="ml-2 flex-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm"
                      />
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" checked={notifyEmail} onChange={(e) => setNotifyEmail(e.target.checked)} className="rounded border-gray-300" />
                      <span className="text-sm text-gray-700">이메일</span>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="example@email.com"
                        className="ml-2 flex-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm"
                      />
                    </label>
                    <p className="text-xs text-gray-500">문자 알림의 경우, 알림톡 수신이 불가할 때에만 발송됩니다.</p>
                  </div>
                </div>

                <div className="flex justify-end gap-2 border-t border-gray-200 pt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setInquiryType('');
                      setContent('');
                      setImageUrls([]);
                      setInquiryError('');
                      setSelectedOrder(null);
                      setOrderLookupNumber('');
                      setOrderLookupPhone('');
                      setOrderLookupError('');
                    }}
                    className="rounded-md border border-red-600 bg-white px-5 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    disabled={inquirySubmitting}
                    className="rounded-md bg-red-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                  >
                    {inquirySubmitting ? '등록 중…' : '등록하기'}
                  </button>
                </div>
              </form>
          </div>
        </section>
      )}

      {tab === 'inquiry-history' && (
        <section className="py-8" aria-label="1:1 문의내역">
          <div className="rounded-lg border border-gray-200 bg-white">
            <div className="flex flex-col gap-4 border-b border-gray-200 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-xl font-bold text-gray-900">1:1 문의내역</h2>
              <button
                type="button"
                onClick={() => setTab('one-to-one')}
                className="text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                1:1 문의하기 &gt;
              </button>
            </div>

            {!getUserToken() ? (
              <div className="px-6 py-12 text-center">
                <p className="text-gray-600">로그인하면 문의내역을 확인할 수 있습니다.</p>
                <Link
                  href={`/login?next=${encodeURIComponent('/order-inquiry')}`}
                  className="mt-4 inline-block rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
                >
                  로그인
                </Link>
              </div>
            ) : (
              <>
                {historyError && (
                  <div className="border-b border-gray-200 px-6 py-3">
                    <p className="text-sm text-red-600">{historyError}</p>
                  </div>
                )}

                {historyLoading && (
                  <p className="px-6 py-12 text-center text-sm text-gray-500">로딩 중…</p>
                )}

                {!historyLoading && inquiryHistory.length === 0 && (
                  <p className="px-6 py-12 text-center text-sm text-gray-500">등록된 문의 내역이 없습니다.</p>
                )}

                {inquiryHistory.length > 0 && (
                  <ul className="divide-y divide-gray-200">
                    {inquiryHistory.map((item) => {
                      const isOpen = expandedHistoryId === item.id;
                      const preview =
                        item.content.length > HISTORY_PREVIEW_LEN
                          ? `${item.content.slice(0, HISTORY_PREVIEW_LEN)}...`
                          : item.content;
                      return (
                        <li key={item.id} className="px-6 py-4">
                          <button
                            type="button"
                            onClick={() => setExpandedHistoryId(isOpen ? null : item.id)}
                            className="flex w-full flex-col gap-1 text-left sm:flex-row sm:items-start sm:justify-between"
                          >
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-gray-900">
                                Q. {item.inquiryType}
                              </p>
                              <p className="mt-0.5 truncate text-sm text-gray-600 sm:max-w-[480px]">
                                {preview}
                              </p>
                            </div>
                            <div className="mt-2 flex shrink-0 items-center gap-2 sm:mt-0">
                              <span
                                className={`inline-flex rounded px-2 py-0.5 text-xs font-medium text-white ${
                                  item.status === 'answered' ? 'bg-gray-900' : 'bg-amber-600'
                                }`}
                              >
                                {item.status === 'answered' ? '답변완료' : '답변 대기중'}
                              </span>
                              <span className="text-sm text-gray-500">{formatHistoryDate(item.createdAt)}</span>
                              <span
                                className={`text-gray-400 transition ${isOpen ? 'rotate-180' : ''}`}
                                aria-hidden
                              >
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </span>
                            </div>
                          </button>
                          {isOpen && (
                            <div className="mt-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-4">
                              <div className="space-y-4">
                                <div>
                                  <p className="text-sm font-semibold text-gray-900">문의 내용</p>
                                  <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed text-gray-800">
                                    {item.content}
                                  </p>
                                </div>
                                {item.answer ? (
                                  <div className="border-t border-gray-200 pt-4">
                                    <p className="text-sm font-semibold text-gray-900">답변</p>
                                    <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed text-gray-800">
                                      {item.answer}
                                    </p>
                                  </div>
                                ) : (
                                  <div className="border-t border-gray-200 pt-4">
                                    <p className="text-sm font-semibold text-gray-900">답변</p>
                                    <p className="mt-2 text-sm text-gray-500">답변 대기 중입니다.</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </>
            )}
          </div>
        </section>
      )}

      {tab === 'guest-order' && (
        <section className="py-8" aria-label="비회원 주문 조회">
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">비회원 주문 조회</h2>
            <p className="mt-2 text-sm text-gray-500">
              주문 번호와 휴대폰 번호를 입력하면 주문 상태를 확인할 수 있습니다. (UI만 구현됨, API 연동 시 동작)
            </p>
            <form
              className="mt-6 space-y-4"
              onSubmit={(e) => e.preventDefault()}
            >
              <div>
                <label htmlFor="order-id" className="block text-sm font-medium text-gray-700">
                  주문 번호
                </label>
                <input
                  id="order-id"
                  type="text"
                  className="mt-1.5 block w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
                  placeholder="예: ORD-001"
                />
              </div>
              <div>
                <label htmlFor="order-phone" className="block text-sm font-medium text-gray-700">
                  휴대폰 번호
                </label>
                <input
                  id="order-phone"
                  type="tel"
                  className="mt-1.5 block w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
                  placeholder="010-0000-0000"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-md border border-gray-700 bg-gray-700 py-2.5 text-sm font-medium text-white hover:bg-gray-600"
              >
                주문 조회
              </button>
            </form>
            <p className="mt-4 text-center text-sm text-gray-500">
              <Link href="/login" className="underline hover:text-gray-900">
                로그인으로 돌아가기
              </Link>
            </p>
          </div>
        </section>
      )}

      <div className="mt-10 border-t border-gray-200 pt-6 text-center text-sm text-gray-500">
        <p>기타 문의: 고객센터 이메일 또는 1:1 문의를 이용해 주세요.</p>
        <Link href="/" className="mt-2 inline-block text-gray-700 underline hover:text-gray-900">
          홈으로
        </Link>
      </div>
    </div>
  );
}
