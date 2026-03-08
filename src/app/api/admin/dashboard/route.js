import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminFromRequest } from '@/lib/admin-auth';

export async function GET(request) {
  const admin = getAdminFromRequest(request);
  if (!admin) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }
  try {
    const [
      partnersPending,
      partnersApproved,
      partnersTotal,
      productsPending,
      productsApproved,
      productsTotal,
      usersTotal,
      ordersTotal,
      ordersPaymentPending,
      ordersPaymentCompleted,
      ordersCancelled,
    ] = await Promise.all([
      prisma.partner.count({ where: { status: 'PENDING' } }),
      prisma.partner.count({ where: { status: 'APPROVED' } }),
      prisma.partner.count(),
      prisma.product.count({ where: { approvalStatus: 'PENDING' } }),
      prisma.product.count({ where: { approvalStatus: 'APPROVED' } }),
      prisma.product.count(),
      prisma.user.count(),
      prisma.order.count(),
      prisma.order.count({ where: { status: 'PAYMENT_PENDING' } }),
      prisma.order.count({ where: { status: 'PAYMENT_COMPLETED' } }),
      prisma.order.count({ where: { status: 'CANCELLED' } }),
    ]);
    return NextResponse.json({
      partnersPending,
      partnersApproved,
      partnersTotal,
      productsPending,
      productsApproved,
      productsTotal,
      usersTotal,
      ordersTotal,
      ordersPaymentPending,
      ordersPaymentCompleted,
      ordersCancelled,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: '대시보드 데이터를 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
