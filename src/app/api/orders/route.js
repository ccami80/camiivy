import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCartSessionId } from '@/lib/cart-session';
import { getUserFromRequest } from '@/lib/user-auth';

function generateOrderNumber() {
  return 'O' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).slice(2, 6).toUpperCase();
}

/** 주문 생성 (장바구니 기반). 승인 상품만, 재고 검사. 로그인 시 userId 저장. */
export async function POST(request) {
  try {
    const userPayload = getUserFromRequest(request);
    const sessionId = getCartSessionId(request);
    if (!sessionId) {
      return NextResponse.json({ error: '장바구니가 비어 있거나 세션이 만료되었습니다.' }, { status: 400 });
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
                shippingFee: true,
              },
            },
          },
        },
      },
    });
    if (!cart || !cart.items.length) {
      return NextResponse.json({ error: '장바구니가 비어 있습니다.' }, { status: 400 });
    }

    for (const item of cart.items) {
      if (item.product.approvalStatus !== 'APPROVED') {
        return NextResponse.json(
          { error: `"${item.product.name}"은(는) 구매할 수 없는 상품입니다.` },
          { status: 400 }
        );
      }
      if (item.quantity > item.product.totalStock) {
        return NextResponse.json(
          { error: `"${item.product.name}" 재고가 부족합니다. (최대 ${item.product.totalStock}개)` },
          { status: 400 }
        );
      }
    }

    const body = await request.json();
    const recipientName = body.recipientName?.trim();
    const recipientPhone = body.recipientPhone?.trim();
    const recipientEmail = body.recipientEmail?.trim();
    const zipCode = body.zipCode?.trim();
    const address = body.address?.trim();
    const addressDetail = body.addressDetail?.trim() || null;
    const memo = body.memo?.trim() || null;

    if (!recipientName || !recipientPhone || !recipientEmail || !zipCode || !address) {
      return NextResponse.json(
        { error: '수령인 이름, 연락처, 이메일, 우편번호, 주소는 필수입니다.' },
        { status: 400 }
      );
    }

    let totalProductAmount = 0;
    const orderItemsData = cart.items.map((item) => {
      const lineTotal = item.product.basePrice * item.quantity;
      totalProductAmount += lineTotal;
      return {
        productId: item.productId,
        productName: item.product.name,
        quantity: item.quantity,
        unitPrice: item.product.basePrice,
        optionLabel: item.optionLabel,
        lineTotal,
      };
    });

    const shippingFee = body.shippingFee != null ? Math.max(0, Math.floor(Number(body.shippingFee))) : 0;
    const totalAmount = totalProductAmount + shippingFee;

    let orderNumber = generateOrderNumber();
    let exists = await prisma.order.findUnique({ where: { orderNumber } });
    while (exists) {
      orderNumber = generateOrderNumber();
      exists = await prisma.order.findUnique({ where: { orderNumber } });
    }

    await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          orderNumber,
          userId: userPayload?.sub ?? null,
          status: 'PAYMENT_PENDING',
          recipientName,
          recipientPhone,
          recipientEmail,
          zipCode,
          address,
          addressDetail,
          totalProductAmount,
          shippingFee,
          totalAmount,
          memo,
        },
      });
      await tx.orderItem.createMany({
        data: orderItemsData.map((row) => ({
          orderId: order.id,
          productId: row.productId,
          productName: row.productName,
          quantity: row.quantity,
          unitPrice: row.unitPrice,
          optionLabel: row.optionLabel,
          lineTotal: row.lineTotal,
        })),
      });
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
    });

    const order = await prisma.order.findFirst({
      where: { orderNumber },
      include: { items: { include: { product: { select: { id: true, name: true, images: { take: 1 } } } } } },
    });
    return NextResponse.json(order);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: '주문 생성 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
