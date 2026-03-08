'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';

const ADMIN_TOKEN_KEY = 'adminToken';

function getToken() {
  return typeof window !== 'undefined' ? localStorage.getItem(ADMIN_TOKEN_KEY) : null;
}

function formatDate(d) {
  if (!d) return '-';
  return new Date(d).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function AdminOneToOneInquiriesPage() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [answerText, setAnswerText] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchList = useCallback(() => {
    const token = getToken();
    if (!token) return;
    setLoading(true);
    setError('');
    fetch('/api/admin/one-to-one-inquiries', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => {
        if (!r.ok) throw new Error('목록을 불러올 수 없습니다.');
        return r.json();
      })
      .then(setList)
      .catch((err) => setError(err.message || '오류가 발생했습니다.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  useEffect(() => {
    if (!selectedId) {
      setDetail(null);
      setAnswerText('');
      return;
    }
    const token = getToken();
    if (!token) return;
    fetch(`/api/admin/one-to-one-inquiries/${selectedId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => {
        if (!r.ok) throw new Error('문의를 불러올 수 없습니다.');
        return r.json();
      })
      .then((data) => {
        setDetail(data);
        setAnswerText(data.answer || '');
      })
      .catch((err) => setError(err.message));
  }, [selectedId]);

  function handleSaveAnswer() {
    if (!selectedId) return;
    const token = getToken();
    if (!token) return;
    setSaving(true);
    setError('');
    fetch(`/api/admin/one-to-one-inquiries/${selectedId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}` },
      body: JSON.stringify({ answer: answerText }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setDetail((d) => (d ? { ...d, answer: answerText, status: 'answered', answeredAt: new Date().toISOString() } : d));
        fetchList();
      })
      .catch((err) => setError(err.message))
      .finally(() => setSaving(false));
  }

  const pendingCount = list.filter((i) => i.status === 'pending').length;

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">고객센터 문의</h1>
      <p className="mt-1 text-sm text-gray-500">
        고객이 등록한 고객센터(1:1) 문의를 확인하고 답변을 등록할 수 있습니다. 미답변 {pendingCount}건
      </p>

      {error && (
        <div className="mt-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {loading ? (
        <p className="mt-6 text-gray-500">로딩 중…</p>
      ) : (
        <div className="mt-6 flex gap-6">
          <div className="min-w-0 flex-1">
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">접수일시</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">문의유형</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">주문정보</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">내용</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">답변상태</th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">관리</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {list.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500">
                        등록된 문의가 없습니다.
                      </td>
                    </tr>
                  ) : (
                    list.map((item) => (
                      <tr
                        key={item.id}
                        className={selectedId === item.id ? 'bg-gray-50' : ''}
                      >
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                          {formatDate(item.createdAt)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">
                          {item.inquiryType}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                          {item.order?.orderNumber || item.orderNumber || '-'}
                        </td>
                        <td className="max-w-[200px] truncate px-4 py-3 text-sm text-gray-600">
                          {item.content}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3">
                          <span
                            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                              item.status === 'answered'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {item.status === 'answered' ? '답변완료' : '미답변'}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-right text-sm">
                          <button
                            type="button"
                            onClick={() => setSelectedId(item.id)}
                            className="font-medium text-blue-600 hover:underline"
                          >
                            {item.status === 'answered' ? '보기' : '답변하기'}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {selectedId && detail && (
            <div className="w-[400px] shrink-0 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                <h2 className="font-medium text-gray-900">문의 상세</h2>
                <button
                  type="button"
                  onClick={() => setSelectedId(null)}
                  className="text-gray-400 hover:text-gray-600"
                  aria-label="닫기"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <dl className="mt-3 space-y-2 text-sm">
                <div>
                  <dt className="text-gray-500">문의유형</dt>
                  <dd className="font-medium text-gray-900">{detail.inquiryType}</dd>
                </div>
                {(detail.orderNumber || detail.order) && (
                  <div>
                    <dt className="text-gray-500">주문정보</dt>
                    <dd className="text-gray-700">
                      {detail.order?.id ? (
                        <Link
                          href={`/admin/orders?orderId=${detail.order.id}`}
                          className="text-blue-600 hover:underline"
                        >
                          {detail.order.orderNumber}
                        </Link>
                      ) : (
                        detail.orderNumber || '-'
                      )}
                    </dd>
                  </div>
                )}
                <div>
                  <dt className="text-gray-500">접수일시</dt>
                  <dd className="text-gray-700">{formatDate(detail.createdAt)}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">문의 내용</dt>
                  <dd className="mt-1 whitespace-pre-wrap rounded bg-gray-50 p-2 text-gray-800">
                    {detail.content}
                  </dd>
                </div>
                {detail.imageUrls?.length > 0 && (
                  <div>
                    <dt className="text-gray-500">첨부 사진</dt>
                    <dd className="mt-1 flex gap-2">
                      {detail.imageUrls.map((url, i) => (
                        <a
                          key={i}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block h-16 w-16 overflow-hidden rounded border border-gray-200"
                        >
                          <img src={url} alt="" className="h-full w-full object-cover" />
                        </a>
                      ))}
                    </dd>
                  </div>
                )}
                <div>
                  <dt className="text-gray-500">답변 알림</dt>
                  <dd className="text-gray-700">
                    {detail.notifySms && detail.phone && `문자 ${detail.phone}`}
                    {detail.notifySms && detail.notifyEmail && ' · '}
                    {detail.notifyEmail && detail.email && `이메일 ${detail.email}`}
                    {!detail.notifySms && !detail.notifyEmail && '-'}
                  </dd>
                </div>
              </dl>
              <div className="mt-4 border-t border-gray-200 pt-4">
                <label className="block text-sm font-medium text-gray-700">관리자 답변</label>
                <textarea
                  value={answerText}
                  onChange={(e) => setAnswerText(e.target.value)}
                  className="mt-1 min-h-[120px] w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  placeholder="답변 내용을 입력하세요."
                  rows={4}
                />
                <button
                  type="button"
                  onClick={handleSaveAnswer}
                  disabled={saving}
                  className="mt-3 w-full rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
                >
                  {saving ? '저장 중…' : '답변 저장'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
