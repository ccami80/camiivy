import api from '@/utils/apis';
import { getBackendUri, admin } from '@/utils/apiPaths';

/**
 * 입점업체(파트너) 목록 조회
 * @param {string} [status] - PENDING | APPROVED | REJECTED
 */
export async function getPartners(status) {
  const path = status
    ? `${admin.partners}?status=${status}`
    : admin.partners;
  return api.get({
    uri: getBackendUri(),
    path,
  });
}

/**
 * 입점업체 승인/반려
 * @param {string} id - partner id
 * @param {string} status - APPROVED | REJECTED
 */
export async function updatePartnerStatus(id, status) {
  return api.patch({
    uri: getBackendUri(),
    path: admin.partner(id),
    data: { status },
  });
}
