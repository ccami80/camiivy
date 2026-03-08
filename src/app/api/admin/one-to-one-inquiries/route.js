import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminFromRequest } from '@/lib/admin-auth';

/** 관리자: 고객센터 문의만 목록 (입점업체가 관리하는 판매자 문의 제외) */
export async function GET(request) {
  const admin = getAdminFromRequest(request);
  if (!admin) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }
  try {
    const list = await prisma.oneToOneInquiry.findMany({
      where: { category: 'CUSTOMER_SERVICE' },
      orderBy: { createdAt: 'desc' },
      include: { order: { select: { id: true, orderNumber: true } } },
    });
    const mapped = list.map((row) => ({
      id: row.id,
      inquiryType: row.inquiryType,
      orderId: row.orderId,
      orderNumber: row.orderNumber,
      orderPhone: row.orderPhone,
      order: row.order ? { id: row.order.id, orderNumber: row.order.orderNumber } : null,
      content: row.content,
      imageUrls: row.imageUrls ? JSON.parse(row.imageUrls) : [],
      notifySms: row.notifySms,
      notifyEmail: row.notifyEmail,
      phone: row.phone,
      email: row.email,
      status: row.status,
      answer: row.answer,
      answeredAt: row.answeredAt?.toISOString?.() ?? row.answeredAt,
      createdAt: row.createdAt?.toISOString?.() ?? row.createdAt,
    }));
    return NextResponse.json(mapped);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: '1:1 문의 목록을 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
