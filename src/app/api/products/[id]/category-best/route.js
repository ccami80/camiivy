import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const LIMIT = 12;
const include = {
  category: { select: { id: true, name: true, slug: true } },
  images: { where: { type: 'main' }, orderBy: { sortOrder: 'asc' }, take: 1 },
};

/** 카테고리별 베스트: 이 상세 페이지 상품의 카테고리(categoryId)와 일치하는 상품만 노출. 관리자 설정(CategoryBestItem)이 있으면 우선 사용, 없으면 같은 카테고리 승인 상품 (displayOrder → 최신순, 현재 상품 제외) */
export async function GET(request, context) {
  try {
    const params = await context.params;
    const id = params?.id;
    if (!id) {
      return NextResponse.json({ error: '상품 ID가 필요합니다.' }, { status: 400 });
    }
    const current = await prisma.product.findFirst({
      where: { id },
      select: { categoryId: true },
    });
    if (!current?.categoryId) {
      return NextResponse.json([]);
    }

    const managed = await prisma.categoryBestItem.findMany({
      where: { categoryId: current.categoryId },
      orderBy: { sortOrder: 'asc' },
      include: { product: { include } },
    });
    const managedList = managed
      .map((r) => r.product)
      .filter((p) => p && p.approvalStatus === 'APPROVED' && p.id !== id);
    if (managedList.length > 0) {
      return NextResponse.json(managedList.slice(0, LIMIT));
    }

    const list = await prisma.product.findMany({
      where: {
        categoryId: current.categoryId,
        id: { not: id },
        approvalStatus: 'APPROVED',
      },
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
      include,
      take: LIMIT,
    });
    return NextResponse.json(list);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: '카테고리 베스트 상품을 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
