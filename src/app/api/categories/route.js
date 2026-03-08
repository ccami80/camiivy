import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/** 공개용: 고양이(CAT) 카테고리는 노출하지 않음 (강아지 전용 사이트) */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const petType = searchParams.get('petType');
    if (petType === 'CAT') return NextResponse.json([]);
    const where = petType ? { petType } : { petType: { not: 'CAT' } };
    const categories = await prisma.category.findMany({
      where,
      orderBy: [{ petType: 'asc' }, { parentId: 'asc' }, { sortOrder: 'asc' }],
    });
    return NextResponse.json(categories);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: '카테고리 목록을 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
