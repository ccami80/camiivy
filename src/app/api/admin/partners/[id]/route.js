import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminFromRequest } from '@/lib/admin-auth';

export async function PATCH(request, context) {
  const admin = getAdminFromRequest(request);
  if (!admin) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }
  const params = await context.params;
  const id = params?.id;
  if (!id) {
    return NextResponse.json({ error: 'ID가 필요합니다.' }, { status: 400 });
  }
  try {
    const body = await request.json();
    const { status } = body;
    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return NextResponse.json(
        { error: 'status는 APPROVED 또는 REJECTED여야 합니다.' },
        { status: 400 }
      );
    }
    const partner = await prisma.partner.update({
      where: { id },
      data: { status },
    });
    return NextResponse.json(partner);
  } catch (e) {
    if (e.code === 'P2025') {
      return NextResponse.json({ error: '입점업체를 찾을 수 없습니다.' }, { status: 404 });
    }
    console.error(e);
    return NextResponse.json(
      { error: '처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
