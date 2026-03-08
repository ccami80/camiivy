import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminFromRequest } from '@/lib/admin-auth';

/** 관리자: 배너 수정 */
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
    const data = {};
    if (body.imageUrl !== undefined) data.imageUrl = String(body.imageUrl).trim();
    if (body.linkUrl !== undefined) data.linkUrl = body.linkUrl ? String(body.linkUrl).trim() : null;
    if (body.title !== undefined) data.title = body.title ? String(body.title).trim() : null;
    if (body.description !== undefined) data.description = body.description ? String(body.description).trim() : null;
    if (body.sortOrder !== undefined) data.sortOrder = Math.floor(Number(body.sortOrder));
    if (body.isActive !== undefined) data.isActive = Boolean(body.isActive);
    const banner = await prisma.banner.update({
      where: { id },
      data,
    });
    return NextResponse.json(banner);
  } catch (e) {
    if (e.code === 'P2025') {
      return NextResponse.json({ error: '배너를 찾을 수 없습니다.' }, { status: 404 });
    }
    console.error(e);
    return NextResponse.json({ error: '수정 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

/** 관리자: 배너 삭제 */
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
    await prisma.banner.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    if (e.code === 'P2025') {
      return NextResponse.json({ error: '배너를 찾을 수 없습니다.' }, { status: 404 });
    }
    console.error(e);
    return NextResponse.json({ error: '삭제 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
