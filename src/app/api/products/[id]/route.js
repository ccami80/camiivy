import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getPartnerFromRequest } from '@/lib/partner-auth';

/**
 * 사용자(공개)용 상품 상세.
 * - 일반: 승인(APPROVED)된 상품만 노출.
 * - 파트너 토큰이 있고 해당 상품의 소유자이면 승인 전에도 조회 가능 (상세 페이지에서 확인용).
 */
export async function GET(request, context) {
  try {
    const params = await context.params;
    const id = params?.id;
    if (!id) {
      return NextResponse.json({ error: '상품 ID가 필요합니다.' }, { status: 400 });
    }
    const partnerPayload = getPartnerFromRequest(request);
    const product = await prisma.product.findFirst({
      where: { id },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        partner: { select: { companyName: true } },
        images: { orderBy: [{ type: 'asc' }, { sortOrder: 'asc' }] },
        variants: true,
      },
    });
    if (!product) {
      return NextResponse.json({ error: '상품을 찾을 수 없습니다.' }, { status: 404 });
    }
    const isOwner = partnerPayload && String(product.partnerId) === String(partnerPayload.sub);
    if (!isOwner && product.approvalStatus !== 'APPROVED') {
      return NextResponse.json({ error: '상품을 찾을 수 없습니다.' }, { status: 404 });
    }
    if (!isOwner && product.petType === 'CAT') {
      return NextResponse.json({ error: '상품을 찾을 수 없습니다.' }, { status: 404 });
    }
    return NextResponse.json(product);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: '상품을 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
