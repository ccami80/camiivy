'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';

const PARTNER_TOKEN_KEY = 'partnerToken';
const statusLabel = { PENDING: '승인 대기', APPROVED: '승인됨', REJECTED: '반려' };

function formatMoney(n) {
  return new Intl.NumberFormat('ko-KR').format(n) + '원';
}

function formatDate(d) {
  if (!d) return '-';
  return new Date(d).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

function formatBusinessNumber(num) {
  if (!num) return '-';
  const s = String(num).replace(/\D/g, '');
  if (s.length === 10) return `${s.slice(0, 3)}-${s.slice(3, 5)}-${s.slice(5)}`;
  return num;
}

export default function PartnerSettlementPage() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [settlement, setSettlement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    companyName: '',
    contactName: '',
    contactPhone: '',
  });

  function getToken() {
    return typeof window !== 'undefined' ? localStorage.getItem(PARTNER_TOKEN_KEY) : null;
  }

  function loadProfile() {
    const token = getToken();
    if (!token) return Promise.resolve();
    return fetch('/api/partner/me', { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error('프로필 조회 실패'))))
      .then((data) => {
        setProfile(data.partner);
        setEditForm({
          companyName: data.partner?.companyName ?? '',
          contactName: data.partner?.contactName ?? '',
          contactPhone: data.partner?.contactPhone ?? '',
        });
      })
      .catch((e) => setError(e.message));
  }

  function loadSettlement() {
    const token = getToken();
    if (!token) return Promise.resolve();
    return fetch('/api/partner/settlement', { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        if (!res.ok) throw new Error('정산 조회 실패');
        return res.json();
      })
      .then(setSettlement)
      .catch((e) => {
        if (!error) setError(e.message || '정산 정보를 불러올 수 없습니다.');
      });
  }

  useEffect(() => {
    Promise.all([loadProfile(), loadSettlement()]).finally(() => setLoading(false));
  }, []);

  async function handleSaveProfile(e) {
    e.preventDefault();
    const token = getToken();
    if (!token) return;
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/partner/me', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          companyName: editForm.companyName.trim(),
          contactName: editForm.contactName.trim(),
          contactPhone: editForm.contactPhone.trim(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || '저장에 실패했습니다.');
        setSaving(false);
        return;
      }
      setProfile(data.partner);
      setEditing(false);
      if (data.requiresReapproval) {
        if (typeof window !== 'undefined') localStorage.removeItem(PARTNER_TOKEN_KEY);
        router.replace('/partner/pending?reapproval=1');
        router.refresh();
        return;
      }
      setEditForm({
        companyName: data.partner.companyName,
        contactName: data.partner.contactName,
        contactPhone: data.partner.contactPhone,
      });
    } catch (err) {
      setError('저장 중 오류가 발생했습니다.');
    }
    setSaving(false);
  }

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-gray-800">정산 · 업체 정보</h1>
        <p className="mt-1 text-sm text-gray-500">
          업체 정보를 확인·수정하고, 결제 완료된 주문 기준 정산 예정 금액을 확인할 수 있습니다.
        </p>
      </div>

      <ErrorMessage message={error} />

      {/* 업체 정보 */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3">
          <h2 className="text-sm font-medium text-gray-700">업체 정보</h2>
          {!editing ? (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="rounded-md bg-gray-800 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-700"
            >
              정보 수정
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              취소
            </button>
          )}
        </div>
        <div className="p-5">
          {!profile ? (
            <p className="text-sm text-gray-500">업체 정보를 불러올 수 없습니다.</p>
          ) : editing ? (
            <form onSubmit={handleSaveProfile} className="max-w-md space-y-4">
              <p className="rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800">
                <strong>업체명</strong>을 변경하면 재승인이 필요합니다. 승인 전까지 서비스 이용이 제한됩니다. 사업자등록번호는 수정할 수 없습니다.
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700">업체명</label>
                <input
                  type="text"
                  value={editForm.companyName}
                  onChange={(e) => setEditForm((p) => ({ ...p, companyName: e.target.value }))}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">사업자 등록번호</label>
                <p className="mt-1 font-mono text-sm text-gray-600">{formatBusinessNumber(profile.businessNumber)}</p>
                <p className="mt-0.5 text-xs text-gray-500">수정 불가</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">담당자명</label>
                <input
                  type="text"
                  value={editForm.contactName}
                  onChange={(e) => setEditForm((p) => ({ ...p, contactName: e.target.value }))}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">담당자 연락처</label>
                <input
                  type="tel"
                  value={editForm.contactPhone}
                  onChange={(e) => setEditForm((p) => ({ ...p, contactPhone: e.target.value }))}
                  required
                  placeholder="010-0000-0000"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
                />
              </div>
              <p className="text-xs text-gray-500">이메일: {profile.email} (변경 불가)</p>
              <button
                type="submit"
                disabled={saving}
                className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
              >
                {saving ? '저장 중…' : '저장'}
              </button>
            </form>
          ) : (
            <dl className="grid gap-3 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-medium uppercase text-gray-400">업체명</dt>
                <dd className="mt-0.5 text-sm font-medium text-gray-900">{profile.companyName}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase text-gray-400">사업자 등록번호</dt>
                <dd className="mt-0.5 font-mono text-sm text-gray-900">
                  {formatBusinessNumber(profile.businessNumber)}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase text-gray-400">담당자</dt>
                <dd className="mt-0.5 text-sm text-gray-900">{profile.contactName}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase text-gray-400">연락처</dt>
                <dd className="mt-0.5 text-sm text-gray-900">{profile.contactPhone}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase text-gray-400">이메일</dt>
                <dd className="mt-0.5 text-sm text-gray-900">{profile.email}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase text-gray-400">상태</dt>
                <dd className="mt-0.5">
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                      profile.status === 'APPROVED'
                        ? 'bg-green-100 text-green-800'
                        : profile.status === 'REJECTED'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {statusLabel[profile.status] ?? profile.status}
                  </span>
                </dd>
              </div>
            </dl>
          )}
        </div>
      </div>

      {/* 정산 */}
      <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
        <h2 className="border-b border-gray-100 px-5 py-3 text-sm font-medium text-gray-700">
          정산 예정 합계
        </h2>
        <div className="p-5">
          <p className="text-2xl font-semibold text-gray-800">
            {settlement != null ? formatMoney(settlement.totalAmount ?? 0) : '-'}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
        <h2 className="border-b border-gray-100 px-5 py-3 text-sm font-medium text-gray-700">
          주문별 정산 금액
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">주문번호</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">결제일</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">금액</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {!settlement?.summary?.length ? (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-sm text-gray-500">
                    정산 내역이 없습니다.
                  </td>
                </tr>
              ) : (
                settlement.summary.map((row) => (
                  <tr key={row.orderNumber}>
                    <td className="px-4 py-3 font-mono text-sm text-gray-800">{row.orderNumber}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{formatDate(row.paidAt)}</td>
                    <td className="px-4 py-3 text-right text-sm font-medium text-gray-800">
                      {formatMoney(row.amount)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
