import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/** 고객센터 FAQ 목록 (공개) */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const where = category && category !== 'all' ? { category } : {};
    const list = await prisma.faq.findMany({
      where,
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });
    return NextResponse.json(list);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'FAQ를 불러오는 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
