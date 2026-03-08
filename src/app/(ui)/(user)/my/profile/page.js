'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { USE_DUMMY, DUMMY_USER } from '../dummyData';

const USER_TOKEN_KEY = 'userToken';

export default function ProfilePage() {
  const [user, setUser] = useState(USE_DUMMY ? DUMMY_USER : null);
  const [loading, setLoading] = useState(!USE_DUMMY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [name, setName] = useState(USE_DUMMY ? DUMMY_USER.name : '');
  const [phone, setPhone] = useState(USE_DUMMY ? DUMMY_USER.phone : '');

  function getToken() {
    return typeof window !== 'undefined' ? localStorage.getItem(USER_TOKEN_KEY) : null;
  }

  useEffect(() => {
    if (USE_DUMMY) return;
    const token = getToken();
    if (!token) return;
    fetch('/api/user/me', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        setUser(data);
        if (data) {
          setName(data.name ?? '');
          setPhone(data.phone ?? '');
        }
      })
      .finally(() => setLoading(false));
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (USE_DUMMY) {
      setUser((prev) => (prev ? { ...prev, name: name.trim(), phone: phone.trim() || null } : null));
      setSaving(false);
      return;
    }
    setSaving(true);
    const token = getToken();
    if (!token) return;
    fetch('/api/user/me', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name: name.trim(), phone: phone.trim() || null }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setUser(data);
      })
      .catch((err) => setError(err.message || '수정에 실패했습니다.'))
      .finally(() => setSaving(false));
  }

  if (loading) return <p className="text-gray-500">로딩 중…</p>;
  if (!user) return <p className="text-gray-500">회원 정보를 불러올 수 없습니다.</p>;

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">회원 정보 수정</h1>
      <form onSubmit={handleSubmit} className="mt-6 max-w-md space-y-4">
        {error && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-700" role="alert">{error}</div>
        )}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">이메일</label>
          <p id="email" className="mt-1 text-gray-600">{user.email}</p>
          <p className="text-xs text-gray-500">이메일은 변경할 수 없습니다.</p>
        </div>
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">이름</label>
          <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500" />
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">연락처</label>
          <input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500" />
        </div>
        <button type="submit" disabled={saving} className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50">
          {saving ? '저장 중…' : '저장'}
        </button>
      </form>
    </div>
  );
}
