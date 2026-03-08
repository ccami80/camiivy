import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/** 주문 단건 조회 (결제/완료 페이지용) */
export async function GET(request, context) {
  try {
    const params = await context.params;
    const id = params?.id;
    if (!id) {
      return NextResponse.json({ error: '주문 ID가 필요합니다.' }, { status: 400 });
    }
    const order = await prisma.order.findUnique({
      where: { id },
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
    return NextResponse.json({ error: '주문을 불러오는 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
