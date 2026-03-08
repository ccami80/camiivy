/** 로그인/로그아웃 시 토큰·스토리지 처리 (Redux와 함께 사용) */

export const USER_TOKEN_KEY = 'userToken';
export const PARTNER_TOKEN_KEY = 'partnerToken';
export const ADMIN_TOKEN_KEY = 'adminToken';

export function getRoleFromEmail(email) {
  if (!email || typeof email !== 'string') return 'user';
  const e = email.trim().toLowerCase();
  if (e.startsWith('admin@')) return 'admin';
  if (e.startsWith('seller@')) return 'partner';
  return 'user';
}

export function setTokensForRole(role) {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(PARTNER_TOKEN_KEY);
  localStorage.removeItem(ADMIN_TOKEN_KEY);
  if (role === 'partner') localStorage.setItem(PARTNER_TOKEN_KEY, 'mock');
  if (role === 'admin') localStorage.setItem(ADMIN_TOKEN_KEY, 'mock');
  if (role === 'user') {
    if (!localStorage.getItem(USER_TOKEN_KEY)) localStorage.setItem(USER_TOKEN_KEY, 'mock');
  } else {
    localStorage.removeItem(USER_TOKEN_KEY);
  }
}

export function clearTokens() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(USER_TOKEN_KEY);
  localStorage.removeItem(PARTNER_TOKEN_KEY);
  localStorage.removeItem(ADMIN_TOKEN_KEY);
}
