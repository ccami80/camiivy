import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminFromRequest } from '@/lib/admin-auth';

/** 관리자: 배너 목록 (전체) */
export async function GET(request) {
  const admin = getAdminFromRequest(request);
  if (!admin) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }
  try {
    const list = await prisma.banner.findMany({
      orderBy: { sortOrder: 'asc' },
    });
    return NextResponse.json(list);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: '배너를 불러오는 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

/** 관리자: 배너 추가 */
export async function POST(request) {
  const admin = getAdminFromRequest(request);
  if (!admin) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }
  try {
    const body = await request.json();
    const { imageUrl, linkUrl, title, description, sortOrder, isActive } = body;
    if (!imageUrl || typeof imageUrl !== 'string' || !imageUrl.trim()) {
      return NextResponse.json({ error: '이미지 URL은 필수입니다.' }, { status: 400 });
    }
    const maxOrder = await prisma.banner.aggregate({ _max: { sortOrder: true } });
    const order = sortOrder != null ? Math.floor(Number(sortOrder)) : (maxOrder._max.sortOrder ?? -1) + 1;
    const banner = await prisma.banner.create({
      data: {
        imageUrl: imageUrl.trim(),
        linkUrl: linkUrl != null ? String(linkUrl).trim() || null : null,
        title: title != null ? String(title).trim() || null : null,
        description: description != null ? String(description).trim() || null : null,
        sortOrder: order,
        isActive: isActive !== false,
      },
    });
    return NextResponse.json(banner);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: '배너 추가 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
