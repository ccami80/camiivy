import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * 사용자(공개)용 상품 목록.
 * 승인 완료(APPROVED)된 상품만 노출. 비승인(PENDING)·반려(REJECTED) 상품은 어떤 경우에도 노출하지 않음.
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const brand = searchParams.get('brand');
    const petType = searchParams.get('petType');
    const categoryId = searchParams.get('categoryId');
    const sortRaw = searchParams.get('sort') || 'latest';
    const sort = sortRaw === 'price_asc' ? 'price-asc' : sortRaw === 'price_desc' ? 'price-desc' : sortRaw;
    const q = searchParams.get('q')?.trim() || '';
    const minPriceRaw = searchParams.get('minPrice');
    const maxPriceRaw = searchParams.get('maxPrice');
    const minPrice = minPriceRaw != null && minPriceRaw !== '' ? parseInt(minPriceRaw, 10) : null;
    const maxPrice = maxPriceRaw != null && maxPriceRaw !== '' ? parseInt(maxPriceRaw, 10) : null;

    // 반드시 APPROVED만 조회. 고양이(CAT) 상품은 노출하지 않음.
    const where = { approvalStatus: 'APPROVED', petType: { not: 'CAT' } };
    if (brand) where.brand = brand;
    if (petType && petType !== 'CAT') where.petType = petType;
    if (petType === 'CAT') return NextResponse.json([]);
    if (q) {
      where.OR = [
        { name: { contains: q } },
        { description: { contains: q } },
      ];
    }
    if (minPrice != null && !Number.isNaN(minPrice)) {
      where.basePrice = typeof where.basePrice === 'object' ? { ...where.basePrice, gte: minPrice } : { gte: minPrice };
    }
    if (maxPrice != null && !Number.isNaN(maxPrice)) {
      where.basePrice = typeof where.basePrice === 'object' ? { ...where.basePrice, lte: maxPrice } : { lte: maxPrice };
    }
    if (categoryId) {
      const allCategories = await prisma.category.findMany({ select: { id: true, parentId: true, petType: true } });
      const catIds = new Set(allCategories.filter((c) => c.petType === 'CAT').map((c) => c.id));
      if (catIds.has(categoryId)) return NextResponse.json([]);
      const idSet = new Set();
      const collect = (id) => {
        idSet.add(id);
        allCategories.filter((c) => c.parentId === id && c.petType !== 'CAT').forEach((c) => collect(c.id));
      };
      collect(categoryId);
      where.categoryId = { in: Array.from(idSet) };
    }

    const include = {
      category: { select: { id: true, name: true, slug: true } },
      images: { where: { type: 'main' }, orderBy: { sortOrder: 'asc' }, take: 1 },
    };
    let products;
    switch (sort) {
      case 'popular':
        // 인기순: 노출순서 우선, 그다음 최신
        const [popWithOrder, popWithoutOrder] = await Promise.all([
          prisma.product.findMany({
            where: { ...where, displayOrder: { not: null } },
            orderBy: { displayOrder: 'asc' },
            include,
          }),
          prisma.product.findMany({
            where: { ...where, displayOrder: null },
            orderBy: { createdAt: 'desc' },
            include,
          }),
        ]);
        products = [...popWithOrder, ...popWithoutOrder];
        break;
      case 'price':
      case 'price_asc':
      case 'price-asc':
        products = await prisma.product.findMany({
          where,
          orderBy: { basePrice: 'asc' },
          include,
        });
        break;
      case 'price_desc':
      case 'price-desc':
        products = await prisma.product.findMany({
          where,
          orderBy: { basePrice: 'desc' },
          include,
        });
        break;
      case 'sales':
        // 판매량순: 재고 적은 순(많이 팔린 가정) → 동일 시 최신순
        products = await prisma.product.findMany({
          where,
          orderBy: [{ totalStock: 'asc' }, { createdAt: 'desc' }],
          include,
        });
        break;
      case 'latest':
      default:
        const [withOrder, withoutOrder] = await Promise.all([
          prisma.product.findMany({
            where: { ...where, displayOrder: { not: null } },
            orderBy: { displayOrder: 'asc' },
            include,
          }),
          prisma.product.findMany({
            where: { ...where, displayOrder: null },
            orderBy: { createdAt: 'desc' },
            include,
          }),
        ]);
        products = [...withOrder, ...withoutOrder];
        break;
    }
    return NextResponse.json(products);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: '상품 목록을 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
