/**
 * 장바구니 세션 ID (비회원). 쿠키 cart_session_id 로 관리.
 */

const CART_COOKIE_NAME = 'cart_session_id';
const CART_COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30일

export function getCartSessionId(request) {
  const fromCookies = request.cookies?.get?.(CART_COOKIE_NAME)?.value;
  if (fromCookies) return fromCookies;
  const cookieHeader = request.headers?.get?.('cookie');
  if (!cookieHeader) return null;
  const part = cookieHeader.split(';').find((c) => c.trim().startsWith(CART_COOKIE_NAME + '='));
  if (!part) return null;
  return part.split('=').slice(1).join('=').trim() || null;
}

export function generateCartSessionId() {
  return 'cart_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 12);
}

export function setCartSessionCookie(sessionId) {
  return `${CART_COOKIE_NAME}=${sessionId}; Path=/; Max-Age=${CART_COOKIE_MAX_AGE}; SameSite=Lax; HttpOnly`;
}
