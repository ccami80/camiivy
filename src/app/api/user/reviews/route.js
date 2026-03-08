import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/user-auth';

/** 내 리뷰 목록 */
export async function GET(request) {
  const payload = getUserFromRequest(request);
  if (!payload) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  }
  try {
    const list = await prisma.review.findMany({
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
    return NextResponse.json(list);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: '조회 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

/** 리뷰 작성 - 구매 완료(결제완료)한 주문 항목에 대해서만 가능 */
export async function POST(request) {
  const payload = getUserFromRequest(request);
  if (!payload) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  }
  try {
    const body = await request.json();
    const { productId, orderItemId, rating, content, bodyType, petType, imageUrls } = body;
    if (!productId || !orderItemId || rating == null || !content) {
      return NextResponse.json({ error: '상품, 주문 항목, 평점, 내용은 필수입니다. (구매 완료한 상품만 리뷰 작성 가능)' }, { status: 400 });
    }
    const ratingNum = Number(rating);
    if (Number.isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return NextResponse.json({ error: '평점은 1~5 사이입니다.' }, { status: 400 });
    }
    const orderItem = await prisma.orderItem.findFirst({
      where: { id: orderItemId, productId },
      include: { order: true },
    });
    if (!orderItem || orderItem.order.userId !== payload.sub) {
      return NextResponse.json({ error: '해당 주문 항목에 대한 권한이 없습니다.' }, { status: 403 });
    }
    if (orderItem.order.status !== 'PAYMENT_COMPLETED') {
      return NextResponse.json({ error: '구매 완료(결제 완료)한 상품만 리뷰를 작성할 수 있습니다.' }, { status: 400 });
    }
    const existingReview = await prisma.review.findUnique({
      where: { orderItemId },
    });
    if (existingReview) {
      return NextResponse.json({ error: '이미 리뷰를 작성한 주문 항목입니다.' }, { status: 400 });
    }
    const imageUrlsStr = Array.isArray(imageUrls) && imageUrls.length > 0
      ? JSON.stringify(imageUrls.slice(0, 10))
      : null;
    const review = await prisma.review.create({
      data: {
        userId: payload.sub,
        productId,
        orderItemId,
        rating: ratingNum,
        content: String(content).trim(),
        bodyType: bodyType ? String(bodyType).trim() : null,
        petType: petType && ['DOG', 'CAT'].includes(petType) ? petType : null,
        imageUrls: imageUrlsStr,
      },
      include: {
        product: {
          select: { id: true, name: true },
        },
      },
    });
    const out = { ...review, imageUrls: imageUrlsStr ? JSON.parse(imageUrlsStr) : [] };
    return NextResponse.json(out);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: '리뷰 작성 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
