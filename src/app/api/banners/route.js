import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/** 공개: 노출 중인 배너 목록 (메인 페이지용) */
export async function GET(request) {
  try {
    const list = await prisma.banner.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
    return NextResponse.json(list);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: '배너를 불러오는 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
