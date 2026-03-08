import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminFromRequest } from '@/lib/admin-auth';

/** 관리자: 주문 단건 조회 */
export async function GET(request, context) {
  const admin = getAdminFromRequest(request);
  if (!admin) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }
  try {
    const params = await Promise.resolve(context.params);
    const id = params?.id;
    if (!id) {
      return NextResponse.json({ error: '주문 ID가 필요합니다.' }, { status: 400 });
    }
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                images: { where: { type: 'main' }, orderBy: { sortOrder: 'asc' }, take: 1 },
              },
            },
          },
        },
        user: { select: { id: true, name: true, email: true } },
      },
    });
    if (!order) {
      return NextResponse.json({ error: '주문을 찾을 수 없습니다.' }, { status: 404 });
    }
    return NextResponse.json(order);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: '주문을 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/** 관리자: 주문 상태 변경 (결제 완료 처리, 취소) */
export async function PATCH(request, context) {
  const admin = getAdminFromRequest(request);
  if (!admin) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }
  try {
    const params = await Promise.resolve(context.params);
    const id = params?.id;
    if (!id) {
      return NextResponse.json({ error: '주문 ID가 필요합니다.' }, { status: 400 });
    }
    const body = await request.json().catch(() => ({}));
    const status = body.status;
    if (!status || !['PAYMENT_COMPLETED', 'CANCELLED'].includes(status)) {
      return NextResponse.json({ error: '유효한 상태를 선택해 주세요. (PAYMENT_COMPLETED, CANCELLED)' }, { status: 400 });
    }

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) {
      return NextResponse.json({ error: '주문을 찾을 수 없습니다.' }, { status: 404 });
    }

    await prisma.order.update({
      where: { id },
      data: {
        status,
        paidAt: status === 'PAYMENT_COMPLETED' ? (order.paidAt || new Date()) : order.paidAt,
      },
    });

    return NextResponse.json({ message: '상태가 변경되었습니다.' });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: '상태 변경에 실패했습니다.' },
      { status: 500 }
    );
  }
}
