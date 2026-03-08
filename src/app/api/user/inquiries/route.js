import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/user-auth';

/** 내가 작성한 상품 문의 목록 (로그인 사용자) */
export async function GET(request) {
  const payload = getUserFromRequest(request);
  if (!payload) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  }

  try {
    const inquiries = await prisma.productInquiry.findMany({
      where: { userId: payload.sub },
      orderBy: { createdAt: 'desc' },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            images: { where: { type: 'main' }, orderBy: { sortOrder: 'asc' }, take: 1 },
          },
        },
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
    }));

    return NextResponse.json({ inquiries: list });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: '문의 목록을 불러오는 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
