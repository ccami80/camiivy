import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminFromRequest } from '@/lib/admin-auth';

const CATEGORIES = ['order', 'delivery', 'cancel', 'account', 'etc'];

/** 관리자: FAQ 수정 */
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
    const { category, question, answer, sortOrder } = body;
    const data = {};
    if (category !== undefined && CATEGORIES.includes(category)) data.category = category;
    if (question !== undefined) {
      const q = String(question).trim();
      if (!q) return NextResponse.json({ error: '질문을 입력해 주세요.' }, { status: 400 });
      data.question = q;
    }
    if (answer !== undefined) {
      const a = String(answer).trim();
      if (!a) return NextResponse.json({ error: '답변을 입력해 주세요.' }, { status: 400 });
      data.answer = a;
    }
    if (sortOrder !== undefined) data.sortOrder = Number(sortOrder);
    const faq = await prisma.faq.update({
      where: { id },
      data,
    });
    return NextResponse.json(faq);
  } catch (e) {
    if (e.code === 'P2025') {
      return NextResponse.json({ error: 'FAQ를 찾을 수 없습니다.' }, { status: 404 });
    }
    console.error(e);
    return NextResponse.json({ error: '수정 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

/** 관리자: FAQ 삭제 */
export async function DELETE(request, context) {
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
    await prisma.faq.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    if (e.code === 'P2025') {
      return NextResponse.json({ error: 'FAQ를 찾을 수 없습니다.' }, { status: 404 });
    }
    console.error(e);
    return NextResponse.json({ error: '삭제 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
