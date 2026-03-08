import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminFromRequest } from '@/lib/admin-auth';

const SECTIONS = ['NEW_BEST', 'BEST'];
const productSelect = {
  id: true,
  name: true,
  basePrice: true,
  approvalStatus: true,
  images: { where: { type: 'main' }, take: 1 },
};

/** 관리자: 메인 섹션별 항목 목록 (query: section = NEW_BEST | BEST) */
export async function GET(request) {
  const admin = getAdminFromRequest(request);
  if (!admin) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }
  const section = request.nextUrl.searchParams.get('section');
  if (!section || !SECTIONS.includes(section)) {
    return NextResponse.json({ error: 'section은 NEW_BEST 또는 BEST여야 합니다.' }, { status: 400 });
  }
  try {
    const list = await prisma.homeSectionItem.findMany({
      where: { section },
      orderBy: { sortOrder: 'asc' },
      include: { product: { select: productSelect } },
    });
    return NextResponse.json(list);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: '목록을 불러오는 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

/** 관리자: 메인 섹션에 상품 추가 */
export async function POST(request) {
  const admin = getAdminFromRequest(request);
  if (!admin) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }
  try {
    const body = await request.json();
    const { section, productId } = body;
    if (!section || !SECTIONS.includes(section) || !productId) {
      return NextResponse.json({ error: 'section(NEW_BEST|BEST)과 productId가 필요합니다.' }, { status: 400 });
    }
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, approvalStatus: true, petType: true },
    });
    if (!product) {
      return NextResponse.json({ error: '상품을 찾을 수 없습니다.' }, { status: 404 });
    }
    if (product.petType === 'CAT') {
      return NextResponse.json({ error: '고양이 상품은 메인에 노출할 수 없습니다.' }, { status: 400 });
    }
    const existing = await prisma.homeSectionItem.findFirst({
      where: { section, productId },
    });
    if (existing) {
      return NextResponse.json({ error: '이미 이 섹션에 등록된 상품입니다.' }, { status: 400 });
    }
    const maxOrder = await prisma.homeSectionItem.aggregate({
      where: { section },
      _max: { sortOrder: true },
    });
    const sortOrder = (maxOrder._max.sortOrder ?? -1) + 1;
    const item = await prisma.homeSectionItem.create({
      data: { section, productId, sortOrder },
      include: { product: { select: productSelect } },
    });
    return NextResponse.json(item);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: '추가 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

/** 관리자: 메인 섹션 순서 일괄 저장 (section + order: [id,...]) */
export async function PATCH(request) {
  const admin = getAdminFromRequest(request);
  if (!admin) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }
  try {
    const body = await request.json();
    const { section, order } = body;
    if (!section || !SECTIONS.includes(section) || !Array.isArray(order) || order.length === 0) {
      return NextResponse.json({ error: 'section과 order 배열이 필요합니다.' }, { status: 400 });
    }
    await prisma.$transaction(
      order.map((id, index) =>
        prisma.homeSectionItem.update({
          where: { id },
          data: { sortOrder: index },
        })
      )
    );
    const list = await prisma.homeSectionItem.findMany({
      where: { section },
      orderBy: { sortOrder: 'asc' },
      include: { product: { select: productSelect } },
    });
    return NextResponse.json(list);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: '순서 저장 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
