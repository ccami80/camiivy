import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/user-auth';

/** 내 리뷰 수정 */
export async function PATCH(request, context) {
  const payload = getUserFromRequest(request);
  if (!payload) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  }
  const params = await context.params;
  const id = params?.id;
  if (!id) {
    return NextResponse.json({ error: '리뷰 ID가 필요합니다.' }, { status: 400 });
  }
  try {
    const existing = await prisma.review.findFirst({
      where: { id, userId: payload.sub },
    });
    if (!existing) {
      return NextResponse.json({ error: '리뷰를 찾을 수 없습니다.' }, { status: 404 });
    }
    const body = await request.json();
    const { rating, content, bodyType, petType, imageUrls } = body;
    const data = {};
    if (rating !== undefined) {
      const ratingNum = Number(rating);
      if (Number.isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
        return NextResponse.json({ error: '평점은 1~5 사이입니다.' }, { status: 400 });
      }
      data.rating = ratingNum;
    }
    if (content !== undefined) data.content = String(content).trim();
    if (bodyType !== undefined) data.bodyType = bodyType ? String(bodyType).trim() : null;
    if (petType !== undefined) data.petType = petType && ['DOG', 'CAT'].includes(petType) ? petType : null;
    if (imageUrls !== undefined) {
      data.imageUrls = Array.isArray(imageUrls) && imageUrls.length > 0
        ? JSON.stringify(imageUrls.slice(0, 10))
        : null;
    }
    const review = await prisma.review.update({
      where: { id },
      data,
      include: {
        product: { select: { id: true, name: true } },
      },
    });
    return NextResponse.json(review);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: '수정 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

/** 내 리뷰 삭제 */
export async function DELETE(request, context) {
  const payload = getUserFromRequest(request);
  if (!payload) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  }
  const params = await context.params;
  const id = params?.id;
  if (!id) {
    return NextResponse.json({ error: '리뷰 ID가 필요합니다.' }, { status: 400 });
  }
  try {
    const existing = await prisma.review.findFirst({
      where: { id, userId: payload.sub },
    });
    if (!existing) {
      return NextResponse.json({ error: '리뷰를 찾을 수 없습니다.' }, { status: 404 });
    }
    await prisma.review.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: '삭제 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
