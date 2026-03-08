import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getPartnerFromRequest } from '@/lib/partner-auth';

/**
 * 파트너 대시보드: partnerId 기준 내 상품 수, 승인 대기 수, 이번 달 매출, 정산 대기 금액.
 */
export async function GET(request) {
  const partner = getPartnerFromRequest(request);
  if (!partner) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }
  const partnerId = partner.sub;

  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1);

  try {
    const [productCounts, monthRevenueRows, settlementPendingRows] = await Promise.all([
      prisma.product.groupBy({
        by: ['approvalStatus'],
        where: { partnerId },
        _count: { id: true },
      }),
      prisma.orderItem.findMany({
        where: {
          product: { partnerId },
          order: {
            paidAt: { not: null, gte: startOfMonth, lt: endOfMonth },
          },
        },
        select: { lineTotal: true },
      }),
      prisma.orderItem.findMany({
        where: {
          product: { partnerId },
          order: { paidAt: { not: null } },
        },
        select: { lineTotal: true },
      }),
    ]);

    const totalProducts = productCounts.reduce((sum, g) => sum + g._count.id, 0);
    const pendingProducts =
      productCounts.find((g) => g.approvalStatus === 'PENDING')?._count.id ?? 0;
    const monthRevenue = monthRevenueRows.reduce((sum, i) => sum + i.lineTotal, 0);
    const settlementPending = settlementPendingRows.reduce((sum, i) => sum + i.lineTotal, 0);

    return NextResponse.json({
      totalProducts,
      pendingProducts,
      monthRevenue,
      settlementPending,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: '대시보드 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }

}
