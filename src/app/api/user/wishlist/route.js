import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/user-auth';

/** 내 찜 목록 */
export async function GET(request) {
  const payload = getUserFromRequest(request);
  if (!payload) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  }
  try {
    const list = await prisma.wishlist.findMany({
      where: { userId: payload.sub },
      orderBy: { createdAt: 'desc' },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            basePrice: true,
            approvalStatus: true,
            images: { where: { type: 'main' }, orderBy: { sortOrder: 'asc' }, take: 1 },
          },
        },
      },
    });
    return NextResponse.json(list);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: '조회 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

/** 찜 추가 */
export async function POST(request) {
  const payload = getUserFromRequest(request);
  if (!payload) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  }
  try {
    const body = await request.json();
    const productId = body.productId;
    if (!productId) {
      return NextResponse.json({ error: '상품 ID가 필요합니다.' }, { status: 400 });
    }
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) {
      return NextResponse.json({ error: '상품을 찾을 수 없습니다.' }, { status: 404 });
    }
    const existing = await prisma.wishlist.findUnique({
      where: {
        userId_productId: { userId: payload.sub, productId },
      },
    });
    if (existing) {
      return NextResponse.json({ success: true, wishlist: existing });
    }
    const wishlist = await prisma.wishlist.create({
      data: {
        userId: payload.sub,
        productId,
      },
      include: {
        product: {
          select: { id: true, name: true, basePrice: true },
        },
      },
    });
    return NextResponse.json(wishlist);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: '찜 추가 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
