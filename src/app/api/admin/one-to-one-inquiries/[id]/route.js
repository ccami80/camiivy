import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminFromRequest } from '@/lib/admin-auth';

/** 관리자: 1:1 문의 단건 조회 */
export async function GET(request, context) {
  const admin = getAdminFromRequest(request);
  if (!admin) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }
  const params = await context.params;
  const id = params?.id;
  if (!id) {
    return NextResponse.json({ error: 'id가 필요합니다.' }, { status: 400 });
  }
  try {
    const row = await prisma.oneToOneInquiry.findUnique({
      where: { id },
      include: { order: { select: { id: true, orderNumber: true } } },
    });
    if (!row) {
      return NextResponse.json({ error: '문의를 찾을 수 없습니다.' }, { status: 404 });
    }
    if (row.category === 'SELLER') {
      return NextResponse.json({ error: '해당 문의는 입점업체에서 관리하는 문의입니다.' }, { status: 403 });
    }
    return NextResponse.json({
      id: row.id,
      inquiryType: row.inquiryType,
      orderId: row.orderId,
      orderNumber: row.orderNumber,
      orderPhone: row.orderPhone,
      order: row.order ? { id: row.order.id, orderNumber: row.order.orderNumber } : null,
      content: row.content,
      imageUrls: row.imageUrls ? JSON.parse(row.imageUrls) : [],
      notifySms: row.notifySms,
      notifyEmail: row.notifyEmail,
      phone: row.phone,
      email: row.email,
      status: row.status,
      answer: row.answer,
      answeredAt: row.answeredAt?.toISOString?.() ?? row.answeredAt,
      createdAt: row.createdAt?.toISOString?.() ?? row.createdAt,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: '문의를 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/** 관리자: 1:1 문의 답변 등록/수정 */
export async function PATCH(request, context) {
  const admin = getAdminFromRequest(request);
  if (!admin) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }
  const params = await context.params;
  const id = params?.id;
  if (!id) {
    return NextResponse.json({ error: 'id가 필요합니다.' }, { status: 400 });
  }
  try {
    const existing = await prisma.oneToOneInquiry.findUnique({
      where: { id },
      select: { id: true, category: true },
    });
    if (!existing) {
      return NextResponse.json({ error: '문의를 찾을 수 없습니다.' }, { status: 404 });
    }
    if (existing.category === 'SELLER') {
      return NextResponse.json({ error: '해당 문의는 입점업체에서 관리하는 문의입니다.' }, { status: 403 });
    }

    const body = await request.json();
    const { answer: answerText } = body;
    const answer = answerText != null ? String(answerText).trim() : null;

    const updated = await prisma.oneToOneInquiry.update({
      where: { id },
      data: {
        answer: answer || null,
        status: answer ? 'answered' : 'pending',
        answeredAt: answer ? new Date() : null,
      },
    });

    return NextResponse.json({
      id: updated.id,
      status: updated.status,
      answer: updated.answer,
      answeredAt: updated.answeredAt?.toISOString?.() ?? updated.answeredAt,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: '답변 저장 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
