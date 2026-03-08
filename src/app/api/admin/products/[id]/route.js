import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminFromRequest } from '@/lib/admin-auth';

/** 관리자용 상품 상세 조회 (승인 여부 무관) */
export async function GET(request, context) {
  const admin = getAdminFromRequest(request);
  if (!admin) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }
  const params = await context.params;
  const id = params?.id;
  if (!id) {
    return NextResponse.json({ error: 'ID가 필요합니다.' }, { status: 400 });
  }
  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        partner: { select: { id: true, companyName: true, email: true, status: true } },
        category: { select: { id: true, name: true, slug: true } },
        images: { orderBy: [{ type: 'asc' }, { sortOrder: 'asc' }] },
      },
    });
    if (!product) {
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

/** 관리자 승인 / 반려 처리. 반려 시 rejectionReason 저장. */
export async function PATCH(request, context) {
  const admin = getAdminFromRequest(request);
  if (!admin) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }
  const params = await context.params;
  const id = params?.id;
  if (!id) {
    return NextResponse.json({ error: 'ID가 필요합니다.' }, { status: 400 });
  }
  try {
    const body = await request.json();
    const { approvalStatus, rejectionReason, detailContent, detailTemplateType, displayOrder } = body;
    const data = {};
    if (approvalStatus !== undefined) {
      if (!['APPROVED', 'REJECTED'].includes(approvalStatus)) {
        return NextResponse.json(
          { error: 'approvalStatus는 APPROVED 또는 REJECTED여야 합니다.' },
          { status: 400 }
        );
      }
      data.approvalStatus = approvalStatus;
      data.rejectionReason = approvalStatus === 'REJECTED'
        ? (rejectionReason != null ? String(rejectionReason).trim() || null : null)
        : null;
    }
    if (detailContent !== undefined) {
      data.detailContent = detailContent ? String(detailContent).trim() : null;
    }
    if (detailTemplateType !== undefined) {
      data.detailTemplateType = detailTemplateType ? String(detailTemplateType).trim() : null;
    }
    if (displayOrder !== undefined) {
      data.displayOrder = displayOrder == null || displayOrder === '' ? null : Number(displayOrder);
    }
    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: 'approvalStatus, detailContent, detailTemplateType, displayOrder 중 하나 이상이 필요합니다.' },
        { status: 400 }
      );
    }
    const product = await prisma.product.update({
      where: { id },
      data,
      include: {
        partner: { select: { companyName: true, email: true } },
        category: { select: { name: true } },
      },
    });
    return NextResponse.json(product);
  } catch (e) {
    if (e.code === 'P2025') {
      return NextResponse.json({ error: '상품을 찾을 수 없습니다.' }, { status: 404 });
    }
    console.error(e);
    return NextResponse.json(
      { error: '처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
