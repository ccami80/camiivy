import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminFromRequest } from '@/lib/admin-auth';

const productInclude = {
  product: {
    select: {
      id: true,
      name: true,
      basePrice: true,
      approvalStatus: true,
      images: { where: { type: 'main' }, take: 1 },
    },
  },
  recommendedProduct: {
    select: {
      id: true,
      name: true,
      basePrice: true,
      approvalStatus: true,
      images: { where: { type: 'main' }, take: 1 },
    },
  },
};

/** 관리자: 특정 상품의 함께 구매 추천 목록 (query: productId) */
export async function GET(request) {
  const admin = getAdminFromRequest(request);
  if (!admin) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }
  const productId = request.nextUrl.searchParams.get('productId');
  if (!productId) {
    return NextResponse.json({ error: 'productId가 필요합니다.' }, { status: 400 });
  }
  try {
    const list = await prisma.productRecommended.findMany({
      where: { productId },
      orderBy: { sortOrder: 'asc' },
      include: productInclude,
    });
    return NextResponse.json(list);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: '추천 목록을 불러오는 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

/** 관리자: 함께 구매 추천 추가 */
export async function POST(request) {
  const admin = getAdminFromRequest(request);
  if (!admin) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }
  try {
    const body = await request.json();
    const { productId, recommendedProductId } = body;
    if (!productId || !recommendedProductId) {
      return NextResponse.json({ error: 'productId와 recommendedProductId가 필요합니다.' }, { status: 400 });
    }
    if (productId === recommendedProductId) {
      return NextResponse.json({ error: '같은 상품은 추천할 수 없습니다.' }, { status: 400 });
    }
    const [product, recommended] = await Promise.all([
      prisma.product.findUnique({ where: { id: productId } }),
      prisma.product.findUnique({ where: { id: recommendedProductId } }),
    ]);
    if (!product || !recommended) {
      return NextResponse.json({ error: '상품을 찾을 수 없습니다.' }, { status: 404 });
    }
    const existing = await prisma.productRecommended.findFirst({
      where: { productId, recommendedProductId },
    });
    if (existing) {
      return NextResponse.json({ error: '이미 등록된 추천 상품입니다.' }, { status: 400 });
    }
    const maxOrder = await prisma.productRecommended.aggregate({
      where: { productId },
      _max: { sortOrder: true },
    });
    const sortOrder = (maxOrder._max.sortOrder ?? -1) + 1;
    const item = await prisma.productRecommended.create({
      data: { productId, recommendedProductId, sortOrder },
      include: productInclude,
    });
    return NextResponse.json(item);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: '추가 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

/** 관리자: 함께 구매 추천 순서 일괄 저장 (productId + order: [id,...]) */
export async function PATCH(request) {
  const admin = getAdminFromRequest(request);
  if (!admin) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }
  try {
    const body = await request.json();
    const { productId, order } = body;
    if (!productId || !Array.isArray(order) || order.length === 0) {
      return NextResponse.json({ error: 'productId와 order 배열이 필요합니다.' }, { status: 400 });
    }
    await prisma.$transaction(
      order.map((id, index) =>
        prisma.productRecommended.update({
          where: { id },
          data: { sortOrder: index },
        })
      )
    );
    const list = await prisma.productRecommended.findMany({
      where: { productId },
      orderBy: { sortOrder: 'asc' },
      include: productInclude,
    });
    return NextResponse.json(list);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: '순서 저장 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
