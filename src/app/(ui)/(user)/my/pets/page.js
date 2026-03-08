'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { USE_DUMMY, DUMMY_PETS } from '../dummyData';

const USER_TOKEN_KEY = 'userToken';
const PET_TYPE_LABEL = { DOG: '강아지', CAT: '고양이' };

export default function PetsPage() {
  const [list, setList] = useState(USE_DUMMY ? DUMMY_PETS : []);
  const [loading, setLoading] = useState(!USE_DUMMY);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ name: '', petType: 'DOG', breed: '', bodyType: '', birthDate: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function getToken() {
    return typeof window !== 'undefined' ? localStorage.getItem(USER_TOKEN_KEY) : null;
  }

  function load() {
    if (USE_DUMMY) {
      setLoading(false);
      return;
    }
    const token = getToken();
    if (!token) return;
    fetch('/api/user/pets', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => (r.ok ? r.json() : []))
      .then(setList)
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  function openAdd() {
    setModal('add');
    setForm({ name: '', petType: 'DOG', breed: '', bodyType: '', birthDate: '' });
    setError('');
  }

  function openEdit(pet) {
    setModal(pet.id);
    setForm({
      name: pet.name,
      petType: pet.petType,
      breed: pet.breed ?? '',
      bodyType: pet.bodyType ?? '',
      birthDate: pet.birthDate ? pet.birthDate.slice(0, 10) : '',
    });
    setError('');
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (USE_DUMMY) {
      if (modal === 'add') {
        setList((prev) => [...prev, { id: `dummy-${Date.now()}`, ...form, breed: form.breed || null, bodyType: form.bodyType || null, birthDate: form.birthDate || null }]);
      } else {
        setList((prev) => prev.map((p) => (p.id === modal ? { ...p, ...form } : p)));
      }
      setModal(null);
      setSaving(false);
      return;
    }
    setSaving(true);
    const token = getToken();
    if (!token) return;
    const url = modal === 'add' ? '/api/user/pets' : `/api/user/pets/${modal}`;
    const method = modal === 'add' ? 'POST' : 'PATCH';
    const body = modal === 'add'
      ? { name: form.name.trim(), petType: form.petType, breed: form.breed || undefined, bodyType: form.bodyType || undefined, birthDate: form.birthDate || undefined }
      : { name: form.name.trim(), petType: form.petType, breed: form.breed || undefined, bodyType: form.bodyType || undefined, birthDate: form.birthDate || undefined };
    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setModal(null);
        load();
      })
      .catch((err) => setError(err.message))
      .finally(() => setSaving(false));
  }

  function handleDelete(id) {
    if (!confirm('삭제하시겠습니까?')) return;
    if (USE_DUMMY) {
      setList((prev) => prev.filter((p) => p.id !== id));
      setModal(null);
      return;
    }
    const token = getToken();
    if (!token) return;
    fetch(`/api/user/pets/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setModal(null);
        load();
      });
  }

  if (loading) return <p className="text-gray-500">로딩 중…</p>;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">반려동물 프로필</h1>
        <button type="button" onClick={openAdd} className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800">
          반려동물 추가
        </button>
      </div>
      {list.length === 0 ? (
        <p className="mt-6 text-gray-500">등록된 반려동물이 없습니다.</p>
      ) : (
        <ul className="mt-6 space-y-3">
          {list.map((pet) => (
            <li key={pet.id} className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4">
              <div>
                <p className="font-medium text-gray-900">{pet.name}</p>
                <p className="text-sm text-gray-500">{PET_TYPE_LABEL[pet.petType] || pet.petType} {pet.breed && `· ${pet.breed}`}</p>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => openEdit(pet)} className="text-sm font-medium text-gray-700 hover:underline">수정</button>
                <button type="button" onClick={() => handleDelete(pet.id)} className="text-sm text-red-600 hover:underline">삭제</button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <h2 className="text-lg font-semibold">{modal === 'add' ? '반려동물 추가' : '반려동물 수정'}</h2>
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              {error && <p className="text-sm text-red-600">{error}</p>}
              <div>
                <label className="block text-sm font-medium text-gray-700">이름 *</label>
                <input type="text" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">종류 *</label>
                <select value={form.petType} onChange={(e) => setForm((f) => ({ ...f, petType: e.target.value }))} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2">
                  <option value="DOG">강아지</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">품종</label>
                <input type="text" value={form.breed} onChange={(e) => setForm((f) => ({ ...f, breed: e.target.value }))} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">체형</label>
                <input type="text" value={form.bodyType} onChange={(e) => setForm((f) => ({ ...f, bodyType: e.target.value }))} placeholder="소형, 중형, 대형 등" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">생년월일</label>
                <input type="date" value={form.birthDate} onChange={(e) => setForm((f) => ({ ...f, birthDate: e.target.value }))} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" disabled={saving} className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50">
                  {saving ? '저장 중…' : '저장'}
                </button>
                <button type="button" onClick={() => setModal(null)} className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                  취소
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
