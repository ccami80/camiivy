import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/user-auth';

/** 찜 삭제 */
export async function DELETE(request, context) {
  const payload = getUserFromRequest(request);
  if (!payload) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  }
  const params = await context.params;
  const productId = params?.productId;
  if (!productId) {
    return NextResponse.json({ error: '상품 ID가 필요합니다.' }, { status: 400 });
  }
  try {
    const existing = await prisma.wishlist.findUnique({
      where: {
        userId_productId: { userId: payload.sub, productId },
      },
    });
    if (!existing) {
      return NextResponse.json({ error: '찜 목록에 없습니다.' }, { status: 404 });
    }
    await prisma.wishlist.delete({
      where: { id: existing.id },
    });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: '삭제 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
