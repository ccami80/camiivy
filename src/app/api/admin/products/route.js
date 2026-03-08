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
    const status = searchParams.get('status');
    const where = { petType: { not: 'CAT' } };
    if (status) where.approvalStatus = status;
    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        partner: {
          select: { id: true, companyName: true, email: true, status: true },
        },
        category: { select: { id: true, name: true, slug: true } },
        images: {
          where: { type: 'main' },
          orderBy: { sortOrder: 'asc' },
          take: 1,
        },
      },
    });
    return NextResponse.json(products);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: '목록을 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
