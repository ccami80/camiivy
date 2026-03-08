import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminFromRequest } from '@/lib/admin-auth';

/** 관리자: 공지사항 수정 */
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
    const { type, title, content, sortOrder } = body;
    const data = {};
    if (type !== undefined) data.type = String(type).trim() || '안내';
    if (title !== undefined) {
      const t = String(title).trim();
      if (!t) return NextResponse.json({ error: '제목을 입력해 주세요.' }, { status: 400 });
      data.title = t;
    }
    if (content !== undefined) data.content = String(content).trim() || null;
    if (sortOrder !== undefined) data.sortOrder = Number(sortOrder);
    const notice = await prisma.notice.update({
      where: { id },
      data,
    });
    return NextResponse.json(notice);
  } catch (e) {
    if (e.code === 'P2025') {
      return NextResponse.json({ error: '공지사항을 찾을 수 없습니다.' }, { status: 404 });
    }
    console.error(e);
    return NextResponse.json({ error: '수정 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

/** 관리자: 공지사항 삭제 */
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
    await prisma.notice.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    if (e.code === 'P2025') {
      return NextResponse.json({ error: '공지사항을 찾을 수 없습니다.' }, { status: 404 });
    }
    console.error(e);
    return NextResponse.json({ error: '삭제 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
