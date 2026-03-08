import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/** 주문 취소. 결제대기만 취소 가능. */
export async function POST(request, context) {
  try {
    const params = await context.params;
    const id = params?.id;
    if (!id) {
      return NextResponse.json({ error: '주문 ID가 필요합니다.' }, { status: 400 });
    }

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) {
      return NextResponse.json({ error: '주문을 찾을 수 없습니다.' }, { status: 404 });
    }
    if (order.status !== 'PAYMENT_PENDING') {
      return NextResponse.json({ error: '결제 대기 상태인 주문만 취소할 수 있습니다.' }, { status: 400 });
    }

    await prisma.order.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });

    const updated = await prisma.order.findUnique({ where: { id } });
    return NextResponse.json(updated);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: '취소 처리 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
