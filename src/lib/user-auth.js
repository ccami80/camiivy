import { verifyUserToken } from '@/lib/auth';

export function getUserFromRequest(request) {
  const auth = request.headers.get('authorization');
  const token = auth?.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return null;
  return verifyUserToken(token);
}
