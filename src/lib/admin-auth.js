import { verifyAdminToken } from '@/lib/auth';

export function getAdminFromRequest(request) {
  const auth = request.headers.get('authorization');
  const token = auth?.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return null;
  return verifyAdminToken(token);
}
