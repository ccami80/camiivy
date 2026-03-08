'use client';

import { useState } from 'react';
import AdminTable from '@/components/admin/AdminTable';
import AdminFilterBar from '@/components/admin/AdminFilterBar';
import Pagination from '@/components/admin/Pagination';
import StatusBadge from '@/components/admin/StatusBadge';

const MOCK_ROWS = [
  { id: 1, name: 'Premium Dog Harness', seller: 'Petwear', status: 'PENDING', date: '2026-02-09' },
  { id: 2, name: 'Cat Scratcher Tower', seller: 'MeongNyang', status: 'APPROVED', date: '2026-02-08' },
  { id: 3, name: 'Organic Dog Treats Set', seller: 'Dog Heaven', status: 'REJECTED', date: '2026-02-07' },
];

const DROPDOWN_OPTIONS = [
  { value: '', label: '전체' },
  { value: 'PENDING', label: '대기' },
  { value: 'APPROVED', label: '승인' },
  { value: 'REJECTED', label: '반려' },
];

export default function AdminExamplePage() {
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const totalPages = 3;

  const rowsWithCells = MOCK_ROWS.map((row) => ({
    ...row,
    status: <StatusBadge status={row.status} />,
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">예시 페이지</h1>
        <p className="mt-2 text-sm text-gray-500">
          공통 관리자 UI(AdminTable, AdminFilterBar, Pagination, StatusBadge) 사용 예시입니다.
        </p>
      </div>

      <AdminFilterBar
        dropdownLabel="상태"
        dropdownOptions={DROPDOWN_OPTIONS}
        dropdownValue={filter}
        onDropdownChange={setFilter}
        searchPlaceholder="상품명 또는 업체명으로 검색…"
        searchValue={search}
        onSearchChange={setSearch}
      />

      <AdminTable
        columns={[
          { key: 'name', label: '상품' },
          { key: 'seller', label: '업체' },
          { key: 'status', label: '상태' },
          { key: 'date', label: '일자' },
        ]}
        rows={rowsWithCells}
        emptyMessage="조건에 맞는 항목이 없습니다."
      />

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPrev={() => setPage((p) => Math.max(1, p - 1))}
        onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
        onPageClick={setPage}
      />
    </div>
  );
}
