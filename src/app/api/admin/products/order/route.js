import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminFromRequest } from '@/lib/admin-auth';

/** 관리자: 상품 노출 순서 저장 (id 배열 순서대로 displayOrder 0,1,2,...) */
export async function PATCH(request) {
  const admin = getAdminFromRequest(request);
  if (!admin) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }
  try {
    const body = await request.json();
    const { productIds } = body;
    if (!Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json({ error: 'productIds 배열이 필요합니다.' }, { status: 400 });
    }
    await prisma.$transaction(
      productIds.map((id, index) =>
        prisma.product.update({
          where: { id },
          data: { displayOrder: index },
        })
      )
    );
    return NextResponse.json({ success: true });
  } catch (e) {
    if (e.code === 'P2025') {
      return NextResponse.json({ error: '일부 상품을 찾을 수 없습니다.' }, { status: 404 });
    }
    console.error(e);
    return NextResponse.json({ error: '순서 저장 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
