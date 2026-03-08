import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const include = {
  images: { where: { type: 'main' }, orderBy: { sortOrder: 'asc' }, take: 1 },
};

/** 메인 페이지용: 신상품 베스트 · 베스트 상품. 관리자 설정이 있으면 사용, 없으면 CAMI 승인 상품으로 자동 채움 */
export async function GET() {
  try {
    const [newBestItems, bestItems] = await Promise.all([
      prisma.homeSectionItem.findMany({
        where: { section: 'NEW_BEST' },
        orderBy: { sortOrder: 'asc' },
        include: { product: { include } },
      }),
      prisma.homeSectionItem.findMany({
        where: { section: 'BEST' },
        orderBy: { sortOrder: 'asc' },
        include: { product: { include } },
      }),
    ]);

    const baseWhere = {
      approvalStatus: 'APPROVED',
      petType: { not: 'CAT' },
      brand: 'CAMI',
    };

    const newBestProducts = newBestItems
      .map((i) => i.product)
      .filter((p) => p && p.approvalStatus === 'APPROVED');
    const bestProducts = bestItems
      .map((i) => i.product)
      .filter((p) => p && p.approvalStatus === 'APPROVED');

    let fallbackNewBest = [];
    let fallbackBest = [];
    if (newBestProducts.length === 0 || bestProducts.length === 0) {
      const [withOrder, withoutOrder] = await Promise.all([
        prisma.product.findMany({
          where: { ...baseWhere, displayOrder: { not: null } },
          orderBy: { displayOrder: 'asc' },
          include,
          take: 10,
        }),
        prisma.product.findMany({
          where: { ...baseWhere, displayOrder: null },
          orderBy: { createdAt: 'desc' },
          include,
          take: 10,
        }),
      ]);
      const combined = [...withOrder, ...withoutOrder];
      if (newBestProducts.length === 0) fallbackNewBest = combined.slice(0, 6);
      if (bestProducts.length === 0) fallbackBest = combined.slice(0, 4);
    }

    return NextResponse.json({
      newBest: newBestProducts.length > 0 ? newBestProducts : fallbackNewBest,
      best: bestProducts.length > 0 ? bestProducts : fallbackBest,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: '메인 섹션을 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
