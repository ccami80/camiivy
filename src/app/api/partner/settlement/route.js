import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getPartnerFromRequest } from '@/lib/partner-auth';

/**
 * 파트너 정산 요약: partnerId 기준 결제 완료 금액 집계.
 */
export async function GET(request) {
  const partner = getPartnerFromRequest(request);
  if (!partner) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }
  const partnerId = partner.sub;

  try {
    const items = await prisma.orderItem.findMany({
      where: {
        product: { partnerId },
        order: { paidAt: { not: null } },
      },
      select: {
        lineTotal: true,
        order: { select: { orderNumber: true, paidAt: true } },
      },
      orderBy: { order: { paidAt: 'desc' } },
    });
    const totalAmount = items.reduce((sum, i) => sum + i.lineTotal, 0);
    const byOrder = items.reduce((acc, i) => {
      const key = i.order.orderNumber;
      if (!acc[key]) acc[key] = { orderNumber: key, paidAt: i.order.paidAt, amount: 0 };
      acc[key].amount += i.lineTotal;
      return acc;
    }, {});
    const summary = Object.values(byOrder);
    return NextResponse.json({
      totalAmount,
      summary,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: '정산 정보를 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
