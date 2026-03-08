'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';

const PARTNER_TOKEN_KEY = 'partnerToken';

export default function PartnerInquiriesPage() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [answeringId, setAnsweringId] = useState(null);
  const [answerText, setAnswerText] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem(PARTNER_TOKEN_KEY) : null;
    if (!token) {
      setLoading(false);
      return;
    }
    fetch('/api/partner/inquiries', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => (r.ok ? r.json() : {}))
      .then((data) => setList(Array.isArray(data.inquiries) ? data.inquiries : []))
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function submitAnswer(inquiryId) {
    if (!answerText.trim()) {
      setError('답변 내용을 입력해 주세요.');
      return;
    }
    const token = typeof window !== 'undefined' ? localStorage.getItem(PARTNER_TOKEN_KEY) : null;
    if (!token) return;
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`/api/partner/inquiries/${inquiryId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ answer: answerText.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || '답변 등록에 실패했습니다.');
        return;
      }
      setAnsweringId(null);
      setAnswerText('');
      load();
    } catch (err) {
      setError('답변 등록에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="py-8 text-center text-gray-500">문의 목록을 불러오는 중…</div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-800">판매자 문의</h1>
        <p className="mt-1 text-sm text-gray-500">내 상품에 등록된 판매자 문의에 답변할 수 있습니다.</p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </div>
      )}

      {list.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white px-6 py-12 text-center text-gray-500">
          등록된 판매자 문의가 없습니다.
        </div>
      ) : (
        <ul className="space-y-4">
          {list.map((inq) => (
            <li key={inq.id} className="rounded-xl border border-gray-200 bg-white overflow-hidden">
              <div className="border-b border-gray-100 px-4 py-3 sm:px-5">
                <div className="flex gap-4">
                  <Link
                    href={`/products/${inq.productId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 overflow-hidden rounded-lg border border-gray-100 bg-gray-50"
                    style={{ width: 56, height: 56 }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={inq.productImageUrl || '/img/cami.jpg'}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/products/${inq.productId}`}
                      className="text-sm font-medium text-gray-900 hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {inq.productName}
                    </Link>
                    {inq.secret && (
                      <span className="ml-2 rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600">비밀글</span>
                    )}
                  </div>
                </div>
                <h2 className="mt-1 text-base font-semibold text-gray-900">{inq.title}</h2>
                <p className="mt-1 text-xs text-gray-500">
                  {inq.writerName} · {new Date(inq.createdAt).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              <div className="px-4 py-3 sm:px-5">
                <p className="whitespace-pre-wrap text-sm text-gray-700">{inq.content}</p>
                {inq.answer ? (
                  <div className="mt-4 rounded-lg bg-gray-50 p-4">
                    <p className="text-xs font-medium text-gray-500">등록한 답변</p>
                    <p className="mt-1 whitespace-pre-wrap text-sm text-gray-800">{inq.answer}</p>
                    {inq.answeredAt && (
                      <p className="mt-2 text-xs text-gray-400">
                        {new Date(inq.answeredAt).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    )}
                    {answeringId === inq.id ? (
                      <div className="mt-3">
                        <textarea
                          value={answerText}
                          onChange={(e) => setAnswerText(e.target.value)}
                          rows={3}
                          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                          placeholder="답변 수정 내용"
                        />
                        <div className="mt-2 flex gap-2">
                          <button
                            type="button"
                            onClick={() => submitAnswer(inq.id)}
                            disabled={saving}
                            className="rounded-md bg-gray-800 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
                          >
                            {saving ? '저장 중…' : '답변 수정'}
                          </button>
                          <button
                            type="button"
                            onClick={() => { setAnsweringId(null); setAnswerText(''); }}
                            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                          >
                            취소
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => { setAnsweringId(inq.id); setAnswerText(inq.answer || ''); setError(''); }}
                        className="mt-2 text-sm text-gray-600 hover:text-gray-900 underline"
                      >
                        답변 수정
                      </button>
                    )}
                  </div>
                ) : answeringId === inq.id ? (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700">답변 작성</label>
                    <textarea
                      value={answerText}
                      onChange={(e) => setAnswerText(e.target.value)}
                      rows={4}
                      className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                      placeholder="답변 내용을 입력하세요"
                    />
                    <div className="mt-2 flex gap-2">
                      <button
                        type="button"
                        onClick={() => submitAnswer(inq.id)}
                        disabled={saving}
                        className="rounded-md bg-gray-800 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
                      >
                        {saving ? '등록 중…' : '답변 등록'}
                      </button>
                      <button
                        type="button"
                        onClick={() => { setAnsweringId(null); setAnswerText(''); }}
                        className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        취소
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={() => { setAnsweringId(inq.id); setAnswerText(''); setError(''); }}
                      className="rounded-md bg-gray-800 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-700"
                    >
                      답변하기
                    </button>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
