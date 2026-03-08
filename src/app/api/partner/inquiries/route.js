import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getPartnerFromRequest } from '@/lib/partner-auth';

/** 입점업체: 내 상품에 달린 문의 목록 */
export async function GET(request) {
  const payload = getPartnerFromRequest(request);
  if (!payload) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }

  try {
    const inquiries = await prisma.productInquiry.findMany({
      where: {
        product: { partnerId: payload.sub },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            images: { where: { type: 'main' }, orderBy: { sortOrder: 'asc' }, take: 1 },
          },
        },
        user: { select: { name: true, email: true } },
      },
    });

    const list = inquiries.map((inq) => ({
      id: inq.id,
      productId: inq.productId,
      productName: inq.product?.name ?? '-',
      productImageUrl: inq.product?.images?.[0]?.url ?? null,
      title: inq.title,
      content: inq.content,
      secret: inq.secret,
      answer: inq.answer,
      answeredAt: inq.answeredAt,
      createdAt: inq.createdAt,
      writerName: inq.user?.name ?? '비회원',
      writerEmail: inq.user?.email ?? null,
    }));

    return NextResponse.json({ inquiries: list });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: '문의 목록을 불러오는 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
