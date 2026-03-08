'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';

function getToken() {
  return typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
}

const FAQ_CATEGORIES = [
  { key: 'order', label: '주문/결제' },
  { key: 'delivery', label: '배송' },
  { key: 'cancel', label: '취소/교환/반품' },
  { key: 'account', label: '회원/로그인' },
  { key: 'etc', label: '기타' },
];

const NOTICE_TYPES = ['안내', '배송', '상품', '이벤트'];

export default function AdminCustomerCenterPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabFromUrl = searchParams?.get('tab');
  const [tab, setTab] = useState(tabFromUrl === 'faq' ? 'faq' : 'notice');
  const [notices, setNotices] = useState([]);

  useEffect(() => {
    setTab(tabFromUrl === 'faq' ? 'faq' : 'notice');
  }, [tabFromUrl]);

  useEffect(() => {
    if (tabFromUrl !== 'notice' && tabFromUrl !== 'faq') {
      router.replace('/admin/customer-center?tab=notice', { scroll: false });
    }
  }, [tabFromUrl, router]);
  const [faqList, setFaqList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 공지사항 폼
  const [noticeForm, setNoticeForm] = useState({ type: '안내', title: '', content: '' });
  const [noticeSubmitting, setNoticeSubmitting] = useState(false);
  const [editingNoticeId, setEditingNoticeId] = useState(null);

  // FAQ 폼
  const [faqForm, setFaqForm] = useState({ category: 'order', question: '', answer: '' });
  const [faqSubmitting, setFaqSubmitting] = useState(false);
  const [editingFaqId, setEditingFaqId] = useState(null);
  const [answerUploading, setAnswerUploading] = useState(false);
  const answerImageInputRef = useRef(null);

  // 1:1 문의 설정
  function load() {
    const token = getToken();
    if (!token) return;
    Promise.all([
      fetch('/api/admin/notices', { headers: { Authorization: `Bearer ${token}` } }).then((r) => (r.ok ? r.json() : [])),
      fetch('/api/admin/faq', { headers: { Authorization: `Bearer ${token}` } }).then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([n, f]) => {
        setNotices(Array.isArray(n) ? n : []);
        setFaqList(Array.isArray(f) ? f : []);
      })
      .catch(() => setError('목록을 불러올 수 없습니다.'))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  function handleNoticeSubmit(e) {
    e.preventDefault();
    if (!noticeForm.title.trim()) return;
    setNoticeSubmitting(true);
    setError('');
    const url = editingNoticeId ? `/api/admin/notices/${editingNoticeId}` : '/api/admin/notices';
    const method = editingNoticeId ? 'PATCH' : 'POST';
    const body = editingNoticeId
      ? { type: noticeForm.type, title: noticeForm.title.trim(), content: noticeForm.content.trim() || null }
      : { type: noticeForm.type, title: noticeForm.title.trim(), content: noticeForm.content.trim() || null };
    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify(body),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setNoticeForm({ type: '안내', title: '', content: '' });
        setEditingNoticeId(null);
        load();
      })
      .catch((err) => setError(err.message))
      .finally(() => setNoticeSubmitting(false));
  }

  function handleNoticeEdit(n) {
    setEditingNoticeId(n.id);
    setNoticeForm({ type: n.type || '안내', title: n.title, content: n.content || '' });
  }

  function handleNoticeDelete(id) {
    if (!confirm('이 공지를 삭제하시겠습니까?')) return;
    fetch(`/api/admin/notices/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${getToken()}` } })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        load();
      })
      .catch((err) => setError(err.message));
  }

  function handleFaqSubmit(e) {
    e.preventDefault();
    if (!faqForm.question.trim() || !faqForm.answer.trim()) return;
    setFaqSubmitting(true);
    setError('');
    const url = editingFaqId ? `/api/admin/faq/${editingFaqId}` : '/api/admin/faq';
    const method = editingFaqId ? 'PATCH' : 'POST';
    const body = editingFaqId
      ? { category: faqForm.category, question: faqForm.question.trim(), answer: faqForm.answer.trim() }
      : { category: faqForm.category, question: faqForm.question.trim(), answer: faqForm.answer.trim() };
    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify(body),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setFaqForm({ category: 'order', question: '', answer: '' });
        setEditingFaqId(null);
        load();
      })
      .catch((err) => setError(err.message))
      .finally(() => setFaqSubmitting(false));
  }

  function handleFaqEdit(f) {
    setEditingFaqId(f.id);
    setFaqForm({ category: f.category, question: f.question, answer: f.answer });
  }

  function handleAnswerImageUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAnswerUploading(true);
    const formData = new FormData();
    formData.append('files', file);
    fetch('/api/admin/upload', {
      method: 'POST',
      headers: { Authorization: `Bearer ${getToken()}` },
      body: formData,
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        const url = data.urls?.[0];
        if (url) {
          const insert = `\n![이미지](${url})\n`;
          setFaqForm((f) => ({ ...f, answer: (f.answer || '').trim() + insert }));
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => {
        setAnswerUploading(false);
        e.target.value = '';
      });
  }

  function handleFaqDelete(id) {
    if (!confirm('이 FAQ를 삭제하시겠습니까?')) return;
    fetch(`/api/admin/faq/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${getToken()}` } })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        load();
      })
      .catch((err) => setError(err.message));
  }

  if (loading) return <p className="text-gray-500">로딩 중…</p>;

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">고객센터 관리</h1>
      <p className="mt-1 text-sm text-gray-500">
        고객센터(공지사항, FAQ) 내용을 관리합니다. 수정한 내용은 <Link href="/order-inquiry" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">고객센터 페이지</Link>에 반영됩니다.
      </p>

      {error && (
        <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">{error}</p>
      )}

      <nav className="mt-8 border-b border-gray-200">
        <ul className="flex gap-0">
          {[
            { key: 'notice', label: '공지사항' },
            { key: 'faq', label: 'FAQ' },
          ].map(({ key, label }) => (
            <li key={key}>
              <button
                type="button"
                onClick={() => {
                  setTab(key);
                  router.replace(`/admin/customer-center?tab=${key}`, { scroll: false });
                }}
                className={`border-b-2 px-6 py-3 text-sm font-medium ${
                  tab === key ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {tab === 'notice' && (
        <div className="mt-8">
          <h2 className="text-lg font-medium text-gray-900">공지사항 등록/수정</h2>
          <form onSubmit={handleNoticeSubmit} className="mt-4 space-y-4 rounded-lg border border-gray-200 bg-gray-50/50 p-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">유형</label>
              <select
                value={noticeForm.type}
                onChange={(e) => setNoticeForm((f) => ({ ...f, type: e.target.value }))}
                className="mt-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
              >
                {NOTICE_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">제목 *</label>
              <input
                type="text"
                value={noticeForm.title}
                onChange={(e) => setNoticeForm((f) => ({ ...f, title: e.target.value }))}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                placeholder="공지 제목"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">내용 (선택)</label>
              <textarea
                value={noticeForm.content}
                onChange={(e) => setNoticeForm((f) => ({ ...f, content: e.target.value }))}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                rows={3}
                placeholder="상세 내용"
              />
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={noticeSubmitting} className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50">
                {editingNoticeId ? '수정' : '등록'}
              </button>
              {editingNoticeId && (
                <button type="button" onClick={() => { setEditingNoticeId(null); setNoticeForm({ type: '안내', title: '', content: '' }); }} className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                  취소
                </button>
              )}
            </div>
          </form>
          <h2 className="mt-10 text-lg font-medium text-gray-900">등록된 공지사항</h2>
          {notices.length === 0 ? (
            <p className="mt-4 text-sm text-gray-500">등록된 공지가 없습니다.</p>
          ) : (
            <ul className="mt-4 divide-y divide-gray-200 border border-gray-200 bg-white">
              {notices.map((n) => (
                <li key={n.id} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <span className="mr-2 rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">{n.type}</span>
                    <span className="font-medium text-gray-900">{n.title}</span>
                    <span className="ml-2 text-xs text-gray-500">{n.createdAt?.slice(0, 10)}</span>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => handleNoticeEdit(n)} className="text-sm text-blue-600 hover:underline">수정</button>
                    <button type="button" onClick={() => handleNoticeDelete(n.id)} className="text-sm text-red-600 hover:underline">삭제</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {tab === 'faq' && (
        <div className="mt-8">
          <h2 className="text-lg font-medium text-gray-900">FAQ 등록/수정</h2>
          <form onSubmit={handleFaqSubmit} className="mt-4 space-y-4 rounded-lg border border-gray-200 bg-gray-50/50 p-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">카테고리</label>
              <select
                value={faqForm.category}
                onChange={(e) => setFaqForm((f) => ({ ...f, category: e.target.value }))}
                className="mt-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
              >
                {FAQ_CATEGORIES.map((c) => (
                  <option key={c.key} value={c.key}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">질문 *</label>
              <input
                type="text"
                value={faqForm.question}
                onChange={(e) => setFaqForm((f) => ({ ...f, question: e.target.value }))}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                placeholder="자주 묻는 질문"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">답변 *</label>
              <p className="mt-0.5 text-xs text-gray-500">
                링크: <code className="rounded bg-gray-200 px-1">[보일 글자](https://주소)</code>
                {' · '}
                이미지: <code className="rounded bg-gray-200 px-1">![설명](이미지주소)</code>
                {' · '}
                아래 버튼으로 이미지를 업로드하면 주소가 자동으로 넣어집니다.
              </p>
              <div className="mt-1 flex gap-2">
                <textarea
                  value={faqForm.answer}
                  onChange={(e) => setFaqForm((f) => ({ ...f, answer: e.target.value }))}
                  className="min-h-[120px] flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
                  rows={6}
                  placeholder="답변 내용 (링크·이미지 마크다운 사용 가능)"
                  required
                />
                <div className="flex flex-col gap-1">
                  <input
                    ref={answerImageInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="hidden"
                    onChange={handleAnswerImageUpload}
                  />
                  <button
                    type="button"
                    disabled={answerUploading}
                    onClick={() => answerImageInputRef.current?.click()}
                    className="shrink-0 rounded-md border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    {answerUploading ? '업로드 중…' : '이미지 넣기'}
                  </button>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={faqSubmitting} className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50">
                {editingFaqId ? '수정' : '등록'}
              </button>
              {editingFaqId && (
                <button type="button" onClick={() => { setEditingFaqId(null); setFaqForm({ category: 'order', question: '', answer: '' }); }} className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                  취소
                </button>
              )}
            </div>
          </form>
          <h2 className="mt-10 text-lg font-medium text-gray-900">등록된 FAQ</h2>
          {faqList.length === 0 ? (
            <p className="mt-4 text-sm text-gray-500">등록된 FAQ가 없습니다.</p>
          ) : (
            <ul className="mt-4 divide-y divide-gray-200 border border-gray-200 bg-white">
              {faqList.map((f) => (
                <li key={f.id} className="px-4 py-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <span className="mr-2 rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                        {FAQ_CATEGORIES.find((c) => c.key === f.category)?.label || f.category}
                      </span>
                      <p className="mt-1 font-medium text-gray-900">Q. {f.question}</p>
                      <p className="mt-0.5 line-clamp-2 text-sm text-gray-600">A. {f.answer}</p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <button type="button" onClick={() => handleFaqEdit(f)} className="text-sm text-blue-600 hover:underline">수정</button>
                      <button type="button" onClick={() => handleFaqDelete(f.id)} className="text-sm text-red-600 hover:underline">삭제</button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
