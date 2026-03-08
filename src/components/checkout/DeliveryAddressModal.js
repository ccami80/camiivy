'use client';

import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'cami_ivy_delivery_addresses';
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

function loadAddresses() {
  if (typeof window === 'undefined') return { list: [], defaultId: null };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const data = raw ? JSON.parse(raw) : {};
    return { list: Array.isArray(data.list) ? data.list : [], defaultId: data.defaultId || null };
  } catch {
    return { list: [], defaultId: null };
  }
}

function saveAddresses(list, defaultId) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ list, defaultId }));
}

const emptyForm = { name: '', zipCode: '', address: '', addressDetail: '', phone: '' };

export default function DeliveryAddressModal({ open, onClose, onSelect }) {
  const [list, setList] = useState([]);
  const [defaultId, setDefaultId] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (open) {
      const { list: saved, defaultId: def } = loadAddresses();
      setList(saved);
      setDefaultId(def);
      setSelectedId(def || (saved[0]?.id ?? null));
      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
    }
  }, [open]);

  const saveToStorage = useCallback((nextList, nextDefaultId) => {
    setList(nextList);
    setDefaultId(nextDefaultId);
    saveAddresses(nextList, nextDefaultId);
  }, []);

  const openAddressSearch = useCallback(() => {
    loadPostcodeScript().then(() => {
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
    }).catch(() => alert('주소 검색 서비스를 불러올 수 없습니다.'));
  }, []);

  const handleSaveAddress = useCallback(() => {
    if (!form.name?.trim() || !form.zipCode?.trim() || !form.address?.trim() || !form.phone?.trim()) {
      alert('받는 분, 주소, 휴대전화번호를 입력해 주세요.');
      return;
    }
    const payload = {
      id: editingId || 'addr_' + Date.now(),
      name: form.name.trim(),
      zipCode: form.zipCode.trim(),
      address: form.address.trim(),
      addressDetail: (form.addressDetail || '').trim(),
      phone: form.phone.trim(),
    };
    let nextList;
    let nextDefaultId = defaultId;
    if (editingId) {
      nextList = list.map((a) => (a.id === editingId ? payload : a));
    } else {
      nextList = [...list, payload];
      if (list.length === 0) nextDefaultId = payload.id;
    }
    saveToStorage(nextList, nextDefaultId);
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  }, [form, editingId, list, defaultId, saveToStorage]);

  const handleSetDefault = useCallback((id) => {
    saveToStorage(list, id);
  }, [list, saveToStorage]);

  const handleDelete = useCallback((id) => {
    if (!confirm('이 배송지를 삭제할까요?')) return;
    const nextList = list.filter((a) => a.id !== id);
    const nextDefaultId = defaultId === id ? (nextList[0]?.id ?? null) : defaultId;
    saveToStorage(nextList, nextDefaultId);
    if (selectedId === id) setSelectedId(nextList[0]?.id ?? null);
  }, [list, defaultId, selectedId, saveToStorage]);

  const handleConfirm = useCallback(() => {
    const addr = list.find((a) => a.id === selectedId);
    if (addr) onSelect?.(addr);
    onClose?.();
  }, [list, selectedId, onSelect, onClose]);

  const openAdd = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (addr) => {
    setForm({
      name: addr.name || '',
      zipCode: addr.zipCode || '',
      address: addr.address || '',
      addressDetail: addr.addressDetail || '',
      phone: addr.phone || '',
    });
    setEditingId(addr.id);
    setShowForm(true);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-labelledby="delivery-modal-title">
      <div className="w-full max-w-lg rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
          <h2 id="delivery-modal-title" className="text-lg font-semibold text-gray-900">배송지 선택</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            aria-label="닫기"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-4">
          {showForm ? (
            <div className="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
              <h3 className="text-sm font-semibold text-gray-800">{editingId ? '배송지 수정' : '새 배송지 추가'}</h3>
              <div>
                <label className="block text-xs text-gray-600">받는 분</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="이름"
                  className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600">배송지</label>
                <div className="mt-1 flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={form.zipCode ? `[${form.zipCode}] ${form.address}` : ''}
                    placeholder="주소 검색"
                    className="flex-1 rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800"
                  />
                  <button type="button" onClick={openAddressSearch} className="shrink-0 rounded border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                    주소 검색
                  </button>
                </div>
                <input
                  type="text"
                  value={form.addressDetail}
                  onChange={(e) => setForm((f) => ({ ...f, addressDetail: e.target.value }))}
                  placeholder="상세 주소 (동/호수)"
                  className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600">휴대전화</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  placeholder="010-0000-0000"
                  className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={handleSaveAddress} className="rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800">
                  저장
                </button>
                <button type="button" onClick={() => { setShowForm(false); setEditingId(null); setForm(emptyForm); }} className="rounded border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                  취소
                </button>
              </div>
            </div>
          ) : (
            <>
              {list.length === 0 ? (
                <p className="py-6 text-center text-sm text-gray-500">등록된 배송지가 없습니다. 새 배송지를 추가해 주세요.</p>
              ) : (
                <ul className="space-y-4">
                  {list.map((addr) => (
                    <li key={addr.id} className="rounded-lg border border-gray-200 p-4">
                      <div className="flex items-start gap-3">
                        <input
                          type="radio"
                          name="delivery-addr"
                          checked={selectedId === addr.id}
                          onChange={() => setSelectedId(addr.id)}
                          className="mt-1 h-4 w-4 border-gray-300 text-gray-900 focus:ring-gray-500"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-medium text-gray-900">{addr.name}</span>
                            {defaultId === addr.id && (
                              <span className="rounded bg-sky-100 px-2 py-0.5 text-xs font-medium text-sky-700">기본배송지</span>
                            )}
                          </div>
                          <p className="mt-1 text-sm text-gray-600">
                            [{addr.zipCode}] {addr.address} {addr.addressDetail || ''}
                          </p>
                          <p className="mt-0.5 text-sm text-gray-500">{addr.phone}</p>
                        </div>
                        <div className="flex shrink-0 gap-1">
                          <button type="button" onClick={() => openEdit(addr)} className="rounded border border-gray-300 bg-white px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50">
                            수정
                          </button>
                          <button type="button" onClick={() => handleSetDefault(addr.id)} className="rounded border border-gray-300 bg-white px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50">
                            기본
                          </button>
                          <button type="button" onClick={() => handleDelete(addr.id)} className="rounded border border-gray-300 bg-white px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 hover:text-red-600">
                            삭제
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              <button
                type="button"
                onClick={openAdd}
                className="mt-4 w-full rounded border border-gray-300 bg-white py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-50"
              >
                새 배송지 추가
              </button>
            </>
          )}
        </div>

        <div className="border-t border-gray-200 p-4">
          <button
            type="button"
            onClick={handleConfirm}
            disabled={list.length === 0 || !selectedId}
            className="w-full rounded bg-red-600 py-3 text-sm font-semibold text-white hover:bg-red-700 disabled:bg-gray-300 disabled:text-gray-500"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}
