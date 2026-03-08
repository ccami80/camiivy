import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/user-auth';

/** 내 주문 상세 (본인 것만) */
export async function GET(request, context) {
  const payload = getUserFromRequest(request);
  if (!payload) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  }
  const params = await context.params;
  const id = params?.id;
  if (!id) {
    return NextResponse.json({ error: '주문 ID가 필요합니다.' }, { status: 400 });
  }
  try {
    const order = await prisma.order.findFirst({
      where: { id, userId: payload.sub },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                images: { where: { type: 'main' }, orderBy: { sortOrder: 'asc' }, take: 1 },
              },
            },
          },
        },
      },
    });
    if (!order) {
      return NextResponse.json({ error: '주문을 찾을 수 없습니다.' }, { status: 404 });
    }
    return NextResponse.json(order);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: '조회 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
