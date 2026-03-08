import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/** 결제 완료 처리 (시뮬레이션). 재고 차감, 상태 결제완료. */
export async function POST(request, context) {
  try {
    const params = await context.params;
    const id = params?.id;
    if (!id) {
      return NextResponse.json({ error: '주문 ID가 필요합니다.' }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: { include: { product: true } } },
    });
    if (!order) {
      return NextResponse.json({ error: '주문을 찾을 수 없습니다.' }, { status: 404 });
    }
    if (order.status !== 'PAYMENT_PENDING') {
      return NextResponse.json({ error: '이미 처리된 주문입니다.' }, { status: 400 });
    }

    for (const item of order.items) {
      if (item.quantity > item.product.totalStock) {
        return NextResponse.json(
          { error: `"${item.product.name}" 재고가 부족하여 결제할 수 없습니다.` },
          { status: 400 }
        );
      }
    }

    await prisma.$transaction(async (tx) => {
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { totalStock: { decrement: item.quantity } },
        });
      }
      await tx.order.update({
        where: { id },
        data: { status: 'PAYMENT_COMPLETED', paidAt: new Date() },
      });
    });

    const updated = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });
    return NextResponse.json(updated);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: '결제 처리 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
