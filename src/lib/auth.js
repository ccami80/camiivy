import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'cami-ivy-admin-secret-change-in-production';

export function hashPassword(password) {
  return bcrypt.hashSync(password, 10);
}

export function verifyPassword(password, hash) {
  return bcrypt.compareSync(password, hash);
}

export function signAdminToken(admin) {
  return jwt.sign(
    { sub: admin.id, role: 'admin', email: admin.email },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

/** 개발용 mock 토큰('mock')도 유효한 관리자로 인정 */
const MOCK_ADMIN_PAYLOAD = { sub: 'mock', role: 'admin', email: 'admin@example.com' };

export function verifyAdminToken(token) {
  if (token === 'mock') return MOCK_ADMIN_PAYLOAD;
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    if (payload.role !== 'admin') return null;
    return payload;
  } catch {
    return null;
  }
}

export function signPartnerToken(partner) {
  return jwt.sign(
    { sub: partner.id, role: 'partner', email: partner.email, status: partner.status },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function verifyPartnerToken(token) {
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    if (payload.role !== 'partner') return null;
    return payload;
  } catch {
    return null;
  }
}

export function signUserToken(user) {
  return jwt.sign(
    { sub: user.id, role: 'user', email: user.email },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

/** 개발용 mock 토큰('mock')도 유효한 사용자로 인정 (sub는 mock, 실제 주문 조회 시 없을 수 있음) */
const MOCK_USER_PAYLOAD = { sub: 'mock', role: 'user', email: 'user@example.com' };

export function verifyUserToken(token) {
  if (token === 'mock') return MOCK_USER_PAYLOAD;
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    if (payload.role !== 'user') return null;
    return payload;
  } catch {
    return null;
  }
}
