import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/user-auth';

/** 내 1:1 문의 내역 (로그인 회원 전용) */
export async function GET(request) {
  const user = getUserFromRequest(request);
  if (!user) {
    return NextResponse.json(
      { error: '로그인이 필요합니다.' },
      { status: 401 }
    );
  }
  try {
    const list = await prisma.oneToOneInquiry.findMany({
      where: { userId: user.sub },
      orderBy: { createdAt: 'desc' },
    });

    const mapped = list.map((row) => ({
      id: row.id,
      inquiryType: row.inquiryType,
      content: row.content,
      status: row.status,
      answer: row.answer,
      answeredAt: row.answeredAt?.toISOString?.() ?? row.answeredAt,
      createdAt: row.createdAt?.toISOString?.() ?? row.createdAt,
    }));

    return NextResponse.json(mapped);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: '문의 내역을 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
