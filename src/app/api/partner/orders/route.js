import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getPartnerFromRequest } from '@/lib/partner-auth';

/**
 * 파트너 주문 목록: 본인 상품이 포함된 주문만 partnerId 기준 조회.
 */
export async function GET(request) {
  const partner = getPartnerFromRequest(request);
  if (!partner) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }
  const partnerId = partner.sub;

  try {
    const orders = await prisma.order.findMany({
      where: {
        items: {
          some: { product: { partnerId } },
        },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          where: { product: { partnerId } },
          include: { product: { select: { id: true, name: true } } },
        },
      },
    });
    const list = orders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      totalAmount: order.totalAmount,
      createdAt: order.createdAt,
      paidAt: order.paidAt,
      partnerItems: order.items,
      partnerAmount: order.items.reduce((sum, i) => sum + i.lineTotal, 0),
    }));
    return NextResponse.json(list);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: '주문 목록을 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
