import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/** 비회원 주문 조회: 주문번호 + 수령인 연락처로 주문 확인 (1:1 문의 주문정보 선택용) */
function normalizePhone(v) {
  if (v == null) return '';
  return String(v).replace(/\D/g, '');
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderNumber = searchParams.get('orderNumber')?.trim();
    const phone = searchParams.get('phone')?.trim();
    if (!orderNumber || !phone) {
      return NextResponse.json(
        { error: '주문번호와 휴대폰 번호를 입력해 주세요.' },
        { status: 400 }
      );
    }
    const phoneNorm = normalizePhone(phone);
    if (phoneNorm.length < 10) {
      return NextResponse.json(
        { error: '올바른 휴대폰 번호를 입력해 주세요.' },
        { status: 400 }
      );
    }

    const order = await prisma.order.findUnique({
      where: { orderNumber },
      select: {
        id: true,
        orderNumber: true,
        recipientPhone: true,
        createdAt: true,
        status: true,
        items: { select: { productName: true, quantity: true } },
      },
    });

    if (!order || normalizePhone(order.recipientPhone) !== phoneNorm) {
      return NextResponse.json(
        { error: '일치하는 주문이 없습니다. 주문번호와 수령인 휴대폰 번호를 확인해 주세요.' },
        { status: 404 }
      );
    }

    const { recipientPhone: _, ...rest } = order;
    return NextResponse.json({
      id: rest.id,
      orderNumber: rest.orderNumber,
      createdAt: rest.createdAt,
      status: rest.status,
      itemSummary: rest.items?.length
        ? rest.items.length > 1
          ? `${rest.items[0].productName} 외 ${rest.items.length - 1}건`
          : rest.items[0].productName
        : '-',
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: '주문 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
