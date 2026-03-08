import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/** 공개: 메인 페이지 큐레이션 상품 목록 (승인 상품만, sortOrder 순) */
export async function GET(request) {
  try {
    const items = await prisma.curationItem.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            basePrice: true,
            brand: true,
            petType: true,
            approvalStatus: true,
            images: { where: { type: 'main' }, orderBy: { sortOrder: 'asc' }, take: 1 },
          },
        },
      },
    });
    const products = items
      .map((i) => i.product)
      .filter((p) => p && p.approvalStatus === 'APPROVED');
    return NextResponse.json(products);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: '큐레이션을 불러오는 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
