'use client';

import { useEffect, useCallback } from 'react';
import { useProductStore } from '@/store/productStore';
import { getAdminProducts, updateProductApproval } from '@/lib/api/productApi';
import ProductApprovalTable from '@/components/admin/ProductApprovalTable';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';

function mapProductToRow(p) {
  return {
    id: p.id,
    name: p.name,
    brand: p.partner?.companyName ?? '-',
    category: p.category?.name ?? '-',
    price: p.basePrice ?? 0,
    image: p.images?.[0]?.url ?? '',
    createdAt: p.createdAt ? String(p.createdAt).slice(0, 10) : '-',
    status: p.approvalStatus,
  };
}

export default function ProductApprovalPage() {
  const {
    list,
    loading,
    error,
    setList,
    setLoading,
    setError,
    updateApprovalById,
  } = useProductStore();

  const fetchList = useCallback(() => {
    setLoading(true);
    getAdminProducts('PENDING')
      .then((data) => setList(Array.isArray(data) ? data : []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [setList, setLoading, setError]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const handleStatusChange = useCallback(
    async (id, status) => {
      const prev = list.find((p) => p.id === id);
      updateApprovalById(id, status);
      try {
        await updateProductApproval(id, status);
        fetchList();
      } catch (err) {
        if (prev) updateApprovalById(id, prev.approvalStatus, prev.rejectionReason);
        setError(err.message || '처리 중 오류가 발생했습니다.');
      }
    },
    [list, updateApprovalById, setError, fetchList]
  );

  const rows = list.map(mapProductToRow);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">상품 승인</h1>
      <p className="mt-1 text-sm text-gray-500">
        입점업체가 등록한 상품을 검토한 뒤 승인 또는 반려할 수 있습니다.
      </p>
      <ErrorMessage message={error} onRetry={fetchList} className="mt-4" />
      <div className="mt-6">
        <ProductApprovalTable
          products={rows}
          onStatusChange={handleStatusChange}
        />
      </div>
    </div>
  );
}
