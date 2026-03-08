import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminFromRequest } from '@/lib/admin-auth';

const CATEGORIES = ['order', 'delivery', 'cancel', 'account', 'etc'];

/** 관리자: FAQ 목록 */
export async function GET(request) {
  const admin = getAdminFromRequest(request);
  if (!admin) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }
  try {
    const list = await prisma.faq.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });
    return NextResponse.json(list);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'FAQ 목록을 불러오는 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

/** 관리자: FAQ 등록 */
export async function POST(request) {
  const admin = getAdminFromRequest(request);
  if (!admin) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }
  try {
    const body = await request.json();
    const { category, question, answer, sortOrder } = body;
    const categoryVal = category && CATEGORIES.includes(category) ? category : 'etc';
    const questionTrim = question != null ? String(question).trim() : '';
    const answerTrim = answer != null ? String(answer).trim() : '';
    if (!questionTrim || !answerTrim) {
      return NextResponse.json({ error: '질문과 답변을 모두 입력해 주세요.' }, { status: 400 });
    }
    const maxOrder = await prisma.faq.aggregate({ _max: { sortOrder: true } });
    const order = sortOrder != null ? Number(sortOrder) : (maxOrder._max.sortOrder ?? -1) + 1;
    const faq = await prisma.faq.create({
      data: {
        category: categoryVal,
        question: questionTrim,
        answer: answerTrim,
        sortOrder: order,
      },
    });
    return NextResponse.json(faq);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'FAQ 등록 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
