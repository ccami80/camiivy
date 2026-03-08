import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/** 공개용: 승인된 상품에서 사용 중인 브랜드 목록 (중복 제거, 정렬) */
export async function GET() {
  try {
    const rows = await prisma.product.findMany({
      where: {
        approvalStatus: 'APPROVED',
        petType: { not: 'CAT' },
      },
      select: { brand: true },
      distinct: ['brand'],
    });
    const brands = rows
      .map((r) => (r.brand && String(r.brand).trim()) || '')
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b, 'ko'));
    return NextResponse.json(brands);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: '브랜드 목록을 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
