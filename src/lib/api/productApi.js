import api from '@/utils/apis';
import { getBackendUri, admin, store } from '@/utils/apiPaths';

/**
 * 관리자: 상품 목록 조회 (승인 상태 필터)
 * @param {string} [approvalStatus] - PENDING | APPROVED | REJECTED
 */
export async function getAdminProducts(approvalStatus) {
  const path = approvalStatus
    ? `${admin.products}?status=${approvalStatus}`
    : admin.products;
  const data = await api.get({
    uri: getBackendUri(),
    path,
  });
  return data;
}

/**
 * 관리자: 상품 단건 조회
 */
export async function getAdminProduct(id) {
  return api.get({
    uri: getBackendUri(),
    path: admin.product(id),
  });
}

/**
 * 관리자: 상품 승인/반려
 * @param {string} id - product id
 * @param {string} approvalStatus - APPROVED | REJECTED
 * @param {string} [rejectionReason]
 */
export async function updateProductApproval(id, approvalStatus, rejectionReason) {
  return api.patch({
    uri: getBackendUri(),
    path: admin.product(id),
    data: {
      approvalStatus,
      rejectionReason: approvalStatus === 'REJECTED' ? rejectionReason : undefined,
    },
  });
}

/**
 * 관리자: 상품 노출 순서 일괄 저장
 * @param {string[]} productIds - 순서대로 id 배열
 */
export async function updateProductDisplayOrder(productIds) {
  return api.patch({
    uri: getBackendUri(),
    path: admin.productOrder,
    data: { productIds },
  });
}

/**
 * 관리자: 상품 노출 여부/순서 단건 업데이트 (displayOrder: number | null, null이면 비노출)
 */
export async function updateProductDisplay(id, displayOrder) {
  return api.patch({
    uri: getBackendUri(),
    path: admin.product(id),
    data: { displayOrder: displayOrder ?? null },
  });
}

/**
 * 쇼핑몰: 상품 목록 (공개용)
 */
export async function getProducts(params = {}) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value != null && value !== '') searchParams.set(key, value);
  });
  const path = searchParams.toString()
    ? `${store.products}?${searchParams.toString()}`
    : store.products;
  const data = await api.get({
    uri: getBackendUri(),
    path,
  });
  return Array.isArray(data) ? data : [];
}

/**
 * 쇼핑몰: 상품 상세
 */
export async function getProduct(id) {
  return api.get({
    uri: getBackendUri(),
    path: store.product(id),
  });
}
