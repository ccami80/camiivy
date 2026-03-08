import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminFromRequest } from '@/lib/admin-auth';
import { generateDetailContent, DETAIL_TEMPLATE_TYPES } from '@/lib/ai-detail';

/** 관리자: 상품 AI 상세 콘텐츠 생성 (저장은 하지 않음, 클라이언트에서 PATCH로 저장) */
export async function POST(request, context) {
  const admin = getAdminFromRequest(request);
  if (!admin) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }
  const params = await context.params;
  const id = params?.id;
  if (!id) {
    return NextResponse.json({ error: '상품 ID가 필요합니다.' }, { status: 400 });
  }
  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: { category: { select: { name: true } } },
    });
    if (!product) {
      return NextResponse.json({ error: '상품을 찾을 수 없습니다.' }, { status: 404 });
    }

    const body = await request.json();
    const templateType = body.templateType && Object.values(DETAIL_TEMPLATE_TYPES).includes(body.templateType)
      ? body.templateType
      : DETAIL_TEMPLATE_TYPES.PREMIUM_LIFESTYLE;
    const inputSummary = body.inputSummary != null ? String(body.inputSummary).trim() : '';

    const { content, templateType: usedType } = await generateDetailContent(
      templateType,
      { name: product.name, description: product.description },
      inputSummary
    );

    return NextResponse.json({ content, templateType: usedType });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: e.message || '상세 콘텐츠 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
