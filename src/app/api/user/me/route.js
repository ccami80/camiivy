import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/user-auth';

/** 로그인 사용자 본인 정보 조회 */
export async function GET(request) {
  const payload = getUserFromRequest(request);
  if (!payload) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  }
  try {
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, name: true, phone: true, createdAt: true },
    });
    if (!user) {
      return NextResponse.json({ error: '회원 정보를 찾을 수 없습니다.' }, { status: 404 });
    }
    return NextResponse.json(user);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: '조회 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

/** 로그인 사용자 본인 정보 수정 */
export async function PATCH(request) {
  const payload = getUserFromRequest(request);
  if (!payload) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  }
  try {
    const body = await request.json();
    const { name, phone } = body;
    const data = {};
    if (name !== undefined) data.name = String(name).trim();
    if (phone !== undefined) data.phone = phone ? String(phone).trim() : null;
    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: '수정할 항목이 없습니다.' }, { status: 400 });
    }
    const user = await prisma.user.update({
      where: { id: payload.sub },
      data,
      select: { id: true, email: true, name: true, phone: true },
    });
    return NextResponse.json(user);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: '수정 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
