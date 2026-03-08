import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getPartnerFromRequest } from '@/lib/partner-auth';

/** 입점업체: 상품 문의에 답변 등록/수정 */
export async function PATCH(request, context) {
  const payload = getPartnerFromRequest(request);
  if (!payload) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }

  const params = await context.params;
  const id = params?.id;
  if (!id) {
    return NextResponse.json({ error: '문의 ID가 필요합니다.' }, { status: 400 });
  }

  const body = await request.json().catch(() => ({}));
  const answer = typeof body.answer === 'string' ? body.answer.trim() : '';
  if (!answer) {
    return NextResponse.json({ error: '답변 내용을 입력해 주세요.' }, { status: 400 });
  }

  try {
    const inquiry = await prisma.productInquiry.findFirst({
      where: { id },
      include: { product: { select: { partnerId: true } } },
    });
    if (!inquiry) {
      return NextResponse.json({ error: '문의를 찾을 수 없습니다.' }, { status: 404 });
    }
    if (String(inquiry.product.partnerId) !== String(payload.sub)) {
      return NextResponse.json({ error: '해당 문의에 답변할 권한이 없습니다.' }, { status: 403 });
    }

    await prisma.productInquiry.update({
      where: { id },
      data: { answer: answer.slice(0, 2000), answeredAt: new Date() },
    });

    return NextResponse.json({ message: '답변이 등록되었습니다.' });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: '답변 등록에 실패했습니다.' }, { status: 500 });
  }
}
