import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminFromRequest } from '@/lib/admin-auth';

export async function GET(request) {
  const admin = getAdminFromRequest(request);
  if (!admin) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // PENDING | APPROVED | REJECTED
    const where = status ? { status } : {};
    const partners = await prisma.partner.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        companyName: true,
        businessNumber: true,
        contactName: true,
        contactPhone: true,
        status: true,
        createdAt: true,
        _count: { select: { products: true } },
      },
    });
    return NextResponse.json(partners);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: '목록을 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
