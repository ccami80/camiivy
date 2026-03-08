'use client';

import Link from 'next/link';
import DashboardStatCard from '@/components/admin/DashboardStatCard';
import AdminTable from '@/components/admin/AdminTable';
import StatusBadge from '@/components/admin/StatusBadge';

const MOCK_SUMMARY = {
  pendingSellers: 3,
  pendingProducts: 5,
  activeProducts: 42,
  productsAddedToday: 2,
};

const MOCK_SELLER_APPROVALS = [
  { id: 1, sellerName: 'Petwear Co.', applicationDate: '2026-02-08', status: 'PENDING' },
  { id: 2, sellerName: 'MeongNyang Shop', applicationDate: '2026-02-07', status: 'PENDING' },
  { id: 3, sellerName: 'Dog Heaven', applicationDate: '2026-02-06', status: 'PENDING' },
];

const MOCK_PRODUCT_APPROVALS = [
  { id: 1, productName: 'Luxury Harness', sellerName: 'Petwear Co.', category: 'Walk', status: 'PENDING' },
  { id: 2, productName: 'Cat Scratcher Tower', sellerName: 'MeongNyang Shop', category: 'Furniture', status: 'PENDING' },
  { id: 3, productName: 'Organic Treats Set', sellerName: 'Dog Heaven', category: 'Food', status: 'PENDING' },
];

const MOCK_ACTIVITY_LOG = [
  "상품 'Luxury Harness' 승인 요청됨",
  "입점업체 'Dog Heaven' 신청 접수",
  "상품 'Cat Scratcher Tower' 승인 요청됨",
  "상품 'Organic Treats Set' 승인 요청됨",
  "입점업체 'MeongNyang Shop' 신청 접수",
];

export default function AdminDashboardPage() {
  const sellerRows = MOCK_SELLER_APPROVALS.map((row) => ({
    ...row,
    status: <StatusBadge status={row.status} />,
    action: (
      <Link
        href="/admin/partners"
        className="rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
      >
        검토
      </Link>
    ),
  }));

  const productRows = MOCK_PRODUCT_APPROVALS.map((row) => ({
    ...row,
    status: <StatusBadge status={row.status} />,
    action: (
      <Link
        href="/admin/products/approval"
        className="rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
      >
        상품 보기
      </Link>
    ),
  }));

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">대시보드</h1>
        <p className="mt-2 text-sm text-gray-500">
          승인 현황 및 활동 요약입니다.
        </p>
      </div>

      <section>
        <h2 className="sr-only">요약</h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <DashboardStatCard
            value={MOCK_SUMMARY.pendingSellers}
            label="입점업체 승인 대기"
            href="/admin/partners"
          />
          <DashboardStatCard
            value={MOCK_SUMMARY.pendingProducts}
            label="상품 승인 대기"
            href="/admin/products/approval"
          />
          <DashboardStatCard
            value={MOCK_SUMMARY.activeProducts}
            label="노출 중인 상품"
            href="/admin/products/display"
          />
          <DashboardStatCard
            value={MOCK_SUMMARY.productsAddedToday}
            label="오늘 등록된 상품"
            href="/admin/products"
          />
        </div>
      </section>

      <section className="">
        <div>
          <h2 className="mb-4 text-xs font-medium uppercase tracking-wider text-gray-500">
            입점업체 승인 목록
          </h2>
          <AdminTable
            columns={[
              { key: 'sellerName', label: '업체명' },
              { key: 'applicationDate', label: '신청일' },
              { key: 'status', label: '상태' },
              { key: 'action', label: '' },
            ]}
            rows={sellerRows}
            emptyMessage="승인 대기 중인 입점업체가 없습니다."
          />
        </div>
        <div>
          <h2 className="mb-4 text-xs font-medium uppercase tracking-wider text-gray-500">
            상품 승인 목록
          </h2>
          <AdminTable
            columns={[
              { key: 'productName', label: '상품명' },
              { key: 'sellerName', label: '업체명' },
              { key: 'category', label: '카테고리' },
              { key: 'status', label: '상태' },
              { key: 'action', label: '' },
            ]}
            rows={productRows}
            emptyMessage="승인 대기 중인 상품이 없습니다."
          />
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xs font-medium uppercase tracking-wider text-gray-500">
          최근 활동 로그
        </h2>
        <div className="rounded-lg border border-gray-100 bg-white p-5">
          <ul className="space-y-3">
            {MOCK_ACTIVITY_LOG.map((text, i) => (
              <li key={i} className="border-b border-gray-100 pb-3 text-sm text-gray-700 last:border-0 last:pb-0">
                {text}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
