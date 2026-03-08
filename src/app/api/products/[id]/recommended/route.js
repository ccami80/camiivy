import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const LIMIT = 10;
const include = {
  category: { select: { id: true, name: true, slug: true } },
  images: { where: { type: 'main' }, orderBy: { sortOrder: 'asc' }, take: 1 },
};

/**
 * 함께 구매하면 좋은 상품: 관리자 설정(ProductRecommended)이 있으면 우선 사용, 없으면 알고리즘(같은 카테고리 → 브랜드/반려동물 → 그 외)
 */
export async function GET(request, context) {
  try {
    const params = await context.params;
    const id = params?.id;
    if (!id) {
      return NextResponse.json({ error: '상품 ID가 필요합니다.' }, { status: 400 });
    }
    const managed = await prisma.productRecommended.findMany({
      where: { productId: id },
      orderBy: { sortOrder: 'asc' },
      include: {
        recommendedProduct: { include },
      },
    });
    const managedList = managed
      .map((r) => r.recommendedProduct)
      .filter((p) => p && p.approvalStatus === 'APPROVED');
    if (managedList.length > 0) {
      return NextResponse.json(managedList.slice(0, LIMIT));
    }

    const current = await prisma.product.findFirst({
      where: { id },
      select: { categoryId: true, brand: true, petType: true },
    });
    if (!current) {
      return NextResponse.json([]);
    }
    const excludeId = id;
    const where = { approvalStatus: 'APPROVED', id: { not: excludeId } };
    const orderBy = { createdAt: 'desc' };

    const [byCategory, byBrand] = await Promise.all([
      prisma.product.findMany({
        where: { ...where, categoryId: current.categoryId },
        orderBy,
        include,
        take: LIMIT,
      }),
      prisma.product.findMany({
        where: { ...where, brand: current.brand, petType: current.petType },
        orderBy,
        include,
        take: LIMIT,
      }),
    ]);

    const seen = new Set(byCategory.map((p) => p.id));
    const combined = [...byCategory];
    for (const p of byBrand) {
      if (combined.length >= LIMIT) break;
      if (!seen.has(p.id)) {
        seen.add(p.id);
        combined.push(p);
      }
    }
    if (combined.length < LIMIT) {
      const excludeIds = [excludeId, ...combined.map((p) => p.id)];
      const rest = await prisma.product.findMany({
        where: { approvalStatus: 'APPROVED', id: { notIn: excludeIds } },
        orderBy,
        include,
        take: LIMIT - combined.length,
      });
      combined.push(...rest);
    }
    return NextResponse.json(combined.slice(0, LIMIT));
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: '추천 상품을 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
