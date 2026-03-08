'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import BreadcrumbNav from '@/components/website/BreadcrumbNav';

const USER_TOKEN_KEY = 'userToken';
const HISTORY_PREVIEW_LEN = 50;

const TYPE_CUSTOMER = 'customer_service';
const TYPE_SELLER = 'seller';
const LABEL_CUSTOMER = '고객센터 문의';
const LABEL_SELLER = '판매자 문의';

function formatHistoryDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

/** 통합 문의 한 건: 고객센터(1:1) 또는 판매자(상품문의) */
function normalizeCustomerItem(row) {
  const raw = row.content ?? '';
  return {
    rowId: `customer_${row.id}`,
    type: TYPE_CUSTOMER,
    typeLabel: LABEL_CUSTOMER,
    content: raw,
    answer: row.answer ?? null,
    status: row.status === 'answered' ? 'answered' : 'pending',
    createdAt: row.createdAt,
  };
}

function normalizeSellerItem(row) {
  const title = row.title ?? '';
  const body = row.content ?? '';
  const content = title ? `${title} ${body}`.trim() : body;
  return {
    rowId: `seller_${row.id}`,
    type: TYPE_SELLER,
    typeLabel: LABEL_SELLER,
    content,
    answer: row.answer ?? null,
    status: row.answer ? 'answered' : 'pending',
    createdAt: row.createdAt,
  };
}

export default function MyInquiriesPage() {
  const [customerList, setCustomerList] = useState([]);
  const [sellerList, setSellerList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  const load = useCallback(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem(USER_TOKEN_KEY) : null;
    if (!token) {
      setLoading(false);
      setCustomerList([]);
      setSellerList([]);
      return;
    }
    setLoading(true);
    setError('');
    Promise.all([
      fetch('/api/inquiry/my', { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
      fetch('/api/user/inquiries', { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
    ])
      .then(([customerData, sellerData]) => {
        if (customerData?.error) throw new Error(customerData.error);
        const oneToOne = Array.isArray(customerData) ? customerData : [];
        const productInq = Array.isArray(sellerData?.inquiries) ? sellerData.inquiries : [];
        setCustomerList(oneToOne.map(normalizeCustomerItem));
        setSellerList(productInq.map(normalizeSellerItem));
      })
      .catch((err) => {
        setError(err.message || '목록을 불러올 수 없습니다.');
        setCustomerList([]);
        setSellerList([]);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const mergedList = useMemo(() => {
    const all = [...customerList, ...sellerList];
    all.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return all;
  }, [customerList, sellerList]);

  return (
    <div className="space-y-6">
      <BreadcrumbNav label="나의 문의 내역" />

      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl">나의 문의 내역</h1>
          <p className="mt-1 text-sm text-gray-500">
            판매자 문의·고객센터 문의 내용과 답변을 확인할 수 있습니다.
          </p>
        </div>
        <Link
          href="/order-inquiry"
          className="shrink-0 text-sm font-medium text-gray-700 hover:text-gray-900"
        >
          1:1 문의하기 &gt;
        </Link>
      </header>

      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {loading ? (
        <p className="py-8 text-center text-gray-500">목록을 불러오는 중…</p>
      ) : mergedList.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white px-6 py-12 text-center">
          <p className="text-gray-500">등록된 문의 내역이 없습니다.</p>
          <Link
            href="/order-inquiry"
            className="mt-3 inline-block rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            1:1 문의하기
          </Link>
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {mergedList.map((item) => {
              const isOpen = expandedId === item.rowId;
              const raw = item.content ?? '';
              const preview =
                raw.length > HISTORY_PREVIEW_LEN
                  ? `${raw.slice(0, HISTORY_PREVIEW_LEN)}...`
                  : raw;
              return (
                <li key={item.rowId} className="px-6 py-4">
                  <button
                    type="button"
                    onClick={() => setExpandedId(isOpen ? null : item.rowId)}
                    className="flex w-full flex-col gap-1 text-left sm:flex-row sm:items-start sm:justify-between"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900">Q. {item.typeLabel}</p>
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
                            {raw}
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
        </div>
      )}
    </div>
  );
}
