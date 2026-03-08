import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminFromRequest } from '@/lib/admin-auth';

const include = {
  category: { select: { id: true, name: true, slug: true } },
  product: {
    select: {
      id: true,
      name: true,
      basePrice: true,
      approvalStatus: true,
      images: { where: { type: 'main' }, take: 1 },
    },
  },
};

/** 관리자: 카테고리별 베스트 목록 (query: categoryId) */
export async function GET(request) {
  const admin = getAdminFromRequest(request);
  if (!admin) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }
  const categoryId = request.nextUrl.searchParams.get('categoryId');
  if (!categoryId) {
    return NextResponse.json({ error: 'categoryId가 필요합니다.' }, { status: 400 });
  }
  try {
    const list = await prisma.categoryBestItem.findMany({
      where: { categoryId },
      orderBy: { sortOrder: 'asc' },
      include,
    });
    return NextResponse.json(list);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: '카테고리 베스트 목록을 불러오는 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

/** 관리자: 카테고리 베스트 상품 추가 */
export async function POST(request) {
  const admin = getAdminFromRequest(request);
  if (!admin) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }
  try {
    const body = await request.json();
    const { categoryId, productId } = body;
    if (!categoryId || !productId) {
      return NextResponse.json({ error: 'categoryId와 productId가 필요합니다.' }, { status: 400 });
    }
    const [category, product] = await Promise.all([
      prisma.category.findUnique({ where: { id: categoryId } }),
      prisma.product.findUnique({ where: { id: productId } }),
    ]);
    if (!category || !product) {
      return NextResponse.json({ error: '카테고리 또는 상품을 찾을 수 없습니다.' }, { status: 404 });
    }
    if (product.categoryId !== categoryId) {
      return NextResponse.json({ error: '해당 카테고리에 속한 상품만 추가할 수 있습니다.' }, { status: 400 });
    }
    const existing = await prisma.categoryBestItem.findFirst({
      where: { categoryId, productId },
    });
    if (existing) {
      return NextResponse.json({ error: '이미 베스트에 등록된 상품입니다.' }, { status: 400 });
    }
    const maxOrder = await prisma.categoryBestItem.aggregate({
      where: { categoryId },
      _max: { sortOrder: true },
    });
    const sortOrder = (maxOrder._max.sortOrder ?? -1) + 1;
    const item = await prisma.categoryBestItem.create({
      data: { categoryId, productId, sortOrder },
      include,
    });
    return NextResponse.json(item);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: '추가 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

/** 관리자: 카테고리 베스트 순서 일괄 저장 (categoryId + order: [id,...]) */
export async function PATCH(request) {
  const admin = getAdminFromRequest(request);
  if (!admin) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }
  try {
    const body = await request.json();
    const { categoryId, order } = body;
    if (!categoryId || !Array.isArray(order) || order.length === 0) {
      return NextResponse.json({ error: 'categoryId와 order 배열이 필요합니다.' }, { status: 400 });
    }
    await prisma.$transaction(
      order.map((id, index) =>
        prisma.categoryBestItem.update({
          where: { id },
          data: { sortOrder: index },
        })
      )
    );
    const list = await prisma.categoryBestItem.findMany({
      where: { categoryId },
      orderBy: { sortOrder: 'asc' },
      include,
    });
    return NextResponse.json(list);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: '순서 저장 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
