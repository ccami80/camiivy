import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminFromRequest } from '@/lib/admin-auth';

/** 관리자: 공지사항 목록 */
export async function GET(request) {
  const admin = getAdminFromRequest(request);
  if (!admin) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }
  try {
    const list = await prisma.notice.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    });
    return NextResponse.json(list);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: '공지사항 목록을 불러오는 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

/** 관리자: 공지사항 등록 */
export async function POST(request) {
  const admin = getAdminFromRequest(request);
  if (!admin) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }
  try {
    const body = await request.json();
    const { type, title, content, sortOrder } = body;
    const titleTrim = title != null ? String(title).trim() : '';
    if (!titleTrim) {
      return NextResponse.json({ error: '제목을 입력해 주세요.' }, { status: 400 });
    }
    const maxOrder = await prisma.notice.aggregate({ _max: { sortOrder: true } });
    const order = sortOrder != null ? Number(sortOrder) : (maxOrder._max.sortOrder ?? -1) + 1;
    const notice = await prisma.notice.create({
      data: {
        type: type && String(type).trim() ? String(type).trim() : '안내',
        title: titleTrim,
        content: content != null ? String(content).trim() || null : null,
        sortOrder: order,
      },
    });
    return NextResponse.json(notice);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: '공지사항 등록 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
