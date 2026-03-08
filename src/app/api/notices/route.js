import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/** 고객센터 공지사항 목록 (공개) */
export async function GET() {
  try {
    const list = await prisma.notice.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      select: { id: true, type: true, title: true, createdAt: true },
    });
    return NextResponse.json(list.map((n) => ({ ...n, date: n.createdAt.toISOString().slice(0, 10) })));
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: '공지사항을 불러오는 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
