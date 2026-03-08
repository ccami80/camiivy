import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCartSessionId, generateCartSessionId, setCartSessionCookie } from '@/lib/cart-session';

/** 장바구니 조회. 쿠키 cart_session_id 기준. */
export async function GET(request) {
  try {
    const sessionId = getCartSessionId(request);
    if (!sessionId) {
      return NextResponse.json({ cart: null, items: [] });
    }
    const cart = await prisma.cart.findUnique({
      where: { sessionId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                basePrice: true,
                totalStock: true,
                approvalStatus: true,
                images: { where: { type: 'main' }, orderBy: { sortOrder: 'asc' }, take: 1 },
              },
            },
          },
        },
      },
    });
    if (!cart) {
      return NextResponse.json({ cart: null, items: [] });
    }
    const items = cart.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      quantity: item.quantity,
      optionLabel: item.optionLabel,
      product: item.product,
      lineTotal: item.product.basePrice * item.quantity,
    }));
    return NextResponse.json({ cart: { id: cart.id, sessionId: cart.sessionId }, items });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: '장바구니를 불러오는 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

/** 장바구니에 상품 추가. 승인(APPROVED) 상품만 가능, 재고 검사. */
export async function POST(request) {
  try {
    let sessionId = getCartSessionId(request);
    let cart = sessionId
      ? await prisma.cart.findUnique({ where: { sessionId }, include: { items: true } })
      : null;
    /** 쿠키가 없었거나, 기존 세션에 해당하는 장바구니가 없을 때 새로 만든 경우 → 클라이언트에 새 sessionId 전달 */
    let createdNewCart = false;
    if (!cart) {
      sessionId = generateCartSessionId();
      cart = await prisma.cart.create({
        data: { sessionId },
        include: { items: true },
      });
      createdNewCart = true;
    }

    const body = await request.json();
    const productId = body.productId;
    const quantity = Math.max(1, Math.floor(Number(body.quantity) || 1));
    const optionLabel = body.optionLabel != null ? String(body.optionLabel).trim() || null : null;

    if (!productId) {
      return NextResponse.json({ error: '상품 ID가 필요합니다.' }, { status: 400 });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, approvalStatus: true, totalStock: true },
    });
    if (!product) {
      return NextResponse.json({ error: '상품을 찾을 수 없습니다.' }, { status: 404 });
    }
    if (product.approvalStatus !== 'APPROVED') {
      return NextResponse.json({ error: '구매할 수 없는 상품입니다.' }, { status: 400 });
    }
    const existing = cart.items.find((i) => i.productId === productId && (i.optionLabel || '') === (optionLabel || ''));
    const newQty = existing ? existing.quantity + quantity : quantity;
    if (newQty > product.totalStock) {
      return NextResponse.json({ error: `재고가 부족합니다. (최대 ${product.totalStock}개)` }, { status: 400 });
    }

    if (existing) {
      await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: newQty },
      });
    } else {
      await prisma.cartItem.create({
        data: { cartId: cart.id, productId, quantity, optionLabel },
      });
    }

    const res = NextResponse.json({ success: true });
    if (createdNewCart) {
      res.headers.set('Set-Cookie', setCartSessionCookie(sessionId));
    }
    return res;
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: '장바구니에 추가하는 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
