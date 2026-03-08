import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/user-auth';

/** 해당 상품에 대해 리뷰 작성 가능 여부(로그인 사용자, 구매 후 6개월 이내, 미작성) */
export async function GET(request) {
  const payload = getUserFromRequest(request);
  if (!payload) {
    return NextResponse.json({ canReview: false, error: '로그인이 필요합니다.' }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get('productId');
  if (!productId) {
    return NextResponse.json({ canReview: false, error: 'productId가 필요합니다.' }, { status: 400 });
  }

  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const orderItem = await prisma.orderItem.findFirst({
      where: {
        productId,
        order: {
          userId: payload.sub,
          status: 'PAYMENT_COMPLETED',
          createdAt: { gte: sixMonthsAgo },
        },
      },
      include: {
        order: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!orderItem) {
      return NextResponse.json({
        canReview: false,
        error: '이 상품의 결제 완료된 구매 내역이 없습니다. 로그인 후 결제까지 완료한 주문에 대해서만 리뷰를 작성할 수 있습니다.',
      });
    }

    const existingReview = await prisma.review.findUnique({
      where: { orderItemId: orderItem.id },
    });
    if (existingReview) {
      return NextResponse.json({
        canReview: false,
        error: '이미 이 상품에 대해 리뷰를 작성하셨습니다.',
      });
    }

    return NextResponse.json({ canReview: true, orderItemId: orderItem.id });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ canReview: false, error: '조회 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
