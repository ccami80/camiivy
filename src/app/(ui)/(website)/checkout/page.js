'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DeliveryAddressModal from '@/components/checkout/DeliveryAddressModal';
import DeliveryRequestModal, { getReceiptLabel, getEntranceLabel } from '@/components/checkout/DeliveryRequestModal';
import api from '@/utils/apis';
import { getBackendUri, store } from '@/utils/apiPaths';
const DAUM_POSTCODE_SCRIPT = 'https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';

function loadPostcodeScript() {
  if (typeof window === 'undefined') return Promise.reject();
  if (window.daum?.Postcode) return Promise.resolve();
  if (document.querySelector(`script[src="${DAUM_POSTCODE_SCRIPT}"]`)) {
    return window.daum?.Postcode ? Promise.resolve() : new Promise((r) => window.addEventListener('load', r));
  }
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = DAUM_POSTCODE_SCRIPT;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

export default function CheckoutPage() {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [deliveryRequestModalOpen, setDeliveryRequestModalOpen] = useState(false);
  const [form, setForm] = useState({
    recipientName: '',
    recipientPhone: '',
    recipientEmail: '',
    zipCode: '',
    address: '',
    addressDetail: '',
    memo: '',
    receiptLocation: 'door',
    receiptLocationCustom: '',
    entranceMethod: 'code',
    entranceMethodDetail: '',
    deliveryRequest: '',
  });

  const handleSaveDeliveryRequest = useCallback((data) => {
    setForm((prev) => ({
      ...prev,
      ...data,
      memo: data.deliveryRequest ?? data.memo ?? prev.memo,
    }));
  }, []);

  const handleSelectAddress = useCallback((addr) => {
    setForm((prev) => ({
      ...prev,
      recipientName: addr.name || prev.recipientName,
      recipientPhone: addr.phone || prev.recipientPhone,
      zipCode: addr.zipCode || '',
      address: addr.address || '',
      addressDetail: addr.addressDetail || '',
      memo: addr.memo || prev.memo,
    }));
  }, []);

  const openAddressSearch = useCallback(() => {
    loadPostcodeScript()
      .then(() => {
        if (typeof window === 'undefined' || !window.daum?.Postcode) return;
        new window.daum.Postcode({
          oncomplete(data) {
            const zonecode = data.zonecode || '';
            let addr = data.address || '';
            if (data.addressType === 'R' && data.bname !== '') {
              addr += data.buildingName ? ` (${data.bname}, ${data.buildingName})` : ` (${data.bname})`;
            } else if (data.buildingName) {
              addr += ` (${data.buildingName})`;
            }
            setForm((prev) => ({ ...prev, zipCode: zonecode, address: addr }));
          },
        }).open();
      })
      .catch(() => alert('주소 검색 서비스를 불러올 수 없습니다.'));
  }, []);

  useEffect(() => {
    api
      .get({ uri: getBackendUri(), path: store.cart })
      .then((data) => setItems(data?.items || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const totalProductAmount = items.reduce((sum, i) => sum + (i.lineTotal || 0), 0);
  const firstShippingFee = items.length > 0 ? items[0].product?.shippingFee : null;
  const shippingFee = firstShippingFee != null && Number.isFinite(Number(firstShippingFee)) ? Number(firstShippingFee) : 0;
  const totalAmount = totalProductAmount + Math.max(0, shippingFee);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    const token = typeof window !== 'undefined' ? localStorage.getItem('userToken') : null;
    const options = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    api
      .post(
        {
          uri: getBackendUri(),
          path: store.orders,
          data: {
            ...form,
            recipientName: form.recipientName.trim(),
            recipientPhone: form.recipientPhone.trim(),
            recipientEmail: form.recipientEmail.trim(),
            zipCode: form.zipCode.trim(),
            address: form.address.trim(),
            addressDetail: form.addressDetail.trim() || undefined,
            memo: form.memo.trim() || undefined,
            shippingFee: Number.isFinite(shippingFee) ? shippingFee : 0,
          },
        },
        options
      )
      .then((data) => {
        if (data?.error) throw new Error(data.error);
        router.push(`/orders/${data?.id}/payment`);
      })
      .catch((err) => {
        setError(err.message || '주문 생성에 실패했습니다.');
      })
      .finally(() => setSubmitting(false));
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <p className="text-gray-500">로딩 중…</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 text-center">
        <p className="text-gray-600">장바구니가 비어 있습니다.</p>
        <Link href="/cart" className="mt-4 inline-block text-sm font-medium text-gray-700 underline">
          장바구니로
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-semibold text-gray-900">주문서 작성</h1>

      <div className="mt-6 rounded-lg border border-gray-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">주문 상품</h2>
        <ul className="divide-y divide-gray-200">
          {items.map((item) => {
            const imageUrl = item.product?.images?.[0]?.url ?? '';
            const subtitle = item.optionLabel || '단일상품';
            return (
              <li key={item.id} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md border border-gray-100 bg-white">
                  {imageUrl ? (
                    <img src={imageUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full bg-gray-100" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900">{item.product?.name}</p>
                  <p className="mt-0.5 text-xs text-gray-500">{subtitle}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-xs text-gray-500">수량 {item.quantity}</p>
                  <p className="mt-0.5 text-sm font-semibold text-gray-900">{(item.lineTotal || 0).toLocaleString()}원</p>
                </div>
              </li>
            );
          })}
        </ul>
        <div className="mt-3 flex justify-between border-t border-gray-100 pt-3 text-sm">
          <span className="text-gray-600">상품 금액</span>
          <span>{totalProductAmount.toLocaleString()}원</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">배송비</span>
          <span>{Number.isFinite(shippingFee) && shippingFee > 0 ? `${shippingFee.toLocaleString()}원` : '무료'}</span>
        </div>
        <div className="mt-2 flex justify-between font-semibold">
          <span>총 결제 금액</span>
          <span>{totalAmount.toLocaleString()}원</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        {error && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-700" role="alert">
            {error}
          </div>
        )}

        {/* 배송정보 */}
        <div className="rounded-lg border border-gray-200 bg-white">
          <h2 className="border-b border-gray-100 px-4 py-3 text-sm font-semibold text-gray-900">배송정보</h2>
          <dl className="divide-y divide-gray-100">
            <div className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:gap-4">
              <dt className="w-28 shrink-0 text-sm text-gray-600">받는 분</dt>
              <dd className="flex flex-1 items-center gap-2">
                <input
                  id="recipientName"
                  name="recipientName"
                  type="text"
                  required
                  value={form.recipientName}
                  onChange={handleChange}
                  placeholder="이름 입력"
                  className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
                />
                <span className="shrink-0 rounded bg-sky-50 px-2 py-0.5 text-xs font-medium text-sky-700">기본배송지</span>
              </dd>
            </div>
            <div className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-start sm:gap-4">
              <dt className="w-28 shrink-0 pt-2 text-sm text-gray-600">배송지</dt>
              <dd className="flex flex-1 flex-col gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="shrink-0 text-sm text-gray-800">
                    {form.zipCode ? `[${form.zipCode}]` : ''}
                  </span>
                  <span className="min-w-0 flex-1 text-sm text-gray-800">
                    {form.address || '주소를 검색해 주세요.'}
                  </span>
                  <button
                    type="button"
                    onClick={openAddressSearch}
                    className="shrink-0 rounded border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    주소 검색
                  </button>
                  <button
                    type="button"
                    onClick={() => setAddressModalOpen(true)}
                    className="shrink-0 rounded border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    변경
                  </button>
                </div>
                <input
                  type="text"
                  name="addressDetail"
                  value={form.addressDetail}
                  onChange={handleChange}
                  placeholder="상세 주소 (동/호수, 건물명 등)"
                  className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
                />
              </dd>
            </div>
            <div className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:gap-4">
              <dt className="w-28 shrink-0 text-sm text-gray-600">휴대전화번호</dt>
              <dd className="flex-1">
                <input
                  id="recipientPhone"
                  name="recipientPhone"
                  type="tel"
                  required
                  value={form.recipientPhone}
                  onChange={handleChange}
                  placeholder="010-0000-0000"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500 sm:max-w-[200px]"
                />
              </dd>
            </div>
            <div className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:gap-4">
              <dt className="w-28 shrink-0 text-sm text-gray-600">이메일</dt>
              <dd className="flex-1">
                <input
                  id="recipientEmail"
                  name="recipientEmail"
                  type="email"
                  required
                  value={form.recipientEmail}
                  onChange={handleChange}
                  placeholder="example@email.com"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500 sm:max-w-[240px]"
                />
              </dd>
            </div>
          </dl>
        </div>

        {/* 배송 요청사항 */}
        <div className="rounded-lg border border-gray-200 bg-white">
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <h2 className="text-sm font-semibold text-gray-900">배송 요청사항</h2>
            <button
              type="button"
              onClick={() => setDeliveryRequestModalOpen(true)}
              className="flex items-center gap-0.5 text-sm font-medium text-red-600 hover:text-red-700"
            >
              변경하기
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          <div className="p-4">
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="shrink-0 text-gray-600">수령위치</dt>
                <dd className="min-w-0 text-right text-gray-900">
                  {getReceiptLabel(form.receiptLocation, form.receiptLocationCustom) || '—'}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="shrink-0 text-gray-600">공동현관 출입 방법</dt>
                <dd className="min-w-0 text-right text-gray-900">
                  {form.entranceMethod === 'code' && form.entranceMethodDetail
                    ? `비밀번호 ${form.entranceMethodDetail}`
                    : getEntranceLabel(form.entranceMethod, form.entranceMethodDetail) || '—'}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="shrink-0 text-gray-600">배송 시 요청사항</dt>
                <dd className="min-w-0 text-right text-gray-900">
                  {form.deliveryRequest || form.memo || '—'}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button type="submit" disabled={submitting} className="rounded-lg bg-gray-900 px-6 py-3 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50">
            {submitting ? '처리 중…' : '결제 페이지로'}
          </button>
          <Link href="/cart" className="rounded-lg border border-gray-300 px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50">
            장바구니로
          </Link>
        </div>
      </form>

      <DeliveryAddressModal
        open={addressModalOpen}
        onClose={() => setAddressModalOpen(false)}
        onSelect={handleSelectAddress}
      />
      <DeliveryRequestModal
        open={deliveryRequestModalOpen}
        onClose={() => setDeliveryRequestModalOpen(false)}
        value={{
          receiptLocation: form.receiptLocation,
          receiptLocationCustom: form.receiptLocationCustom,
          entranceMethod: form.entranceMethod,
          entranceMethodDetail: form.entranceMethodDetail,
          deliveryRequest: form.deliveryRequest,
          memo: form.memo,
        }}
        onSave={handleSaveDeliveryRequest}
      />
    </div>
  );
}
