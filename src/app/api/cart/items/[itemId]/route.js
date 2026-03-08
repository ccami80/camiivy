import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCartSessionId } from '@/lib/cart-session';

/** 장바구니 항목 수량 변경 또는 삭제 */
export async function PATCH(request, context) {
  try {
    const sessionId = getCartSessionId(request);
    if (!sessionId) {
      return NextResponse.json({ error: '장바구니 세션이 없습니다.' }, { status: 401 });
    }
    const params = await context.params;
    const itemId = params?.itemId;
    if (!itemId) {
      return NextResponse.json({ error: '항목 ID가 필요합니다.' }, { status: 400 });
    }

    const cart = await prisma.cart.findUnique({
      where: { sessionId },
      include: { items: { where: { id: itemId }, include: { product: true } } },
    });
    if (!cart || !cart.items.length) {
      return NextResponse.json({ error: '장바구니 항목을 찾을 수 없습니다.' }, { status: 404 });
    }

    const body = await request.json();
    const quantity = body.quantity != null ? Math.floor(Number(body.quantity)) : null;
    if (quantity !== null) {
      if (quantity < 1) {
        await prisma.cartItem.delete({ where: { id: itemId } });
        return NextResponse.json({ success: true, removed: true });
      }
      const item = cart.items[0];
      if (quantity > item.product.totalStock) {
        return NextResponse.json({ error: `재고는 최대 ${item.product.totalStock}개입니다.` }, { status: 400 });
      }
      await prisma.cartItem.update({ where: { id: itemId }, data: { quantity } });
    }
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: '수정 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

/** 장바구니 항목 삭제 */
export async function DELETE(request, context) {
  try {
    const sessionId = getCartSessionId(request);
    if (!sessionId) {
      return NextResponse.json({ error: '장바구니 세션이 없습니다.' }, { status: 401 });
    }
    const params = await context.params;
    const itemId = params?.itemId;
    if (!itemId) {
      return NextResponse.json({ error: '항목 ID가 필요합니다.' }, { status: 400 });
    }

    const cart = await prisma.cart.findUnique({
      where: { sessionId },
      include: { items: { where: { id: itemId } } },
    });
    if (!cart || !cart.items.length) {
      return NextResponse.json({ error: '장바구니 항목을 찾을 수 없습니다.' }, { status: 404 });
    }

    await prisma.cartItem.delete({ where: { id: itemId } });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: '삭제 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
