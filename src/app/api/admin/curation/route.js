import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminFromRequest } from '@/lib/admin-auth';

/** 관리자: 큐레이션 항목 목록 */
export async function GET(request) {
  const admin = getAdminFromRequest(request);
  if (!admin) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }
  try {
    const list = await prisma.curationItem.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            basePrice: true,
            approvalStatus: true,
            images: { where: { type: 'main' }, take: 1 },
          },
        },
      },
    });
    return NextResponse.json(list);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: '큐레이션을 불러오는 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

/** 관리자: 큐레이션에 상품 추가 */
export async function POST(request) {
  const admin = getAdminFromRequest(request);
  if (!admin) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }
  try {
    const body = await request.json();
    const productId = body.productId;
    if (!productId) {
      return NextResponse.json({ error: '상품 ID가 필요합니다.' }, { status: 400 });
    }
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return NextResponse.json({ error: '상품을 찾을 수 없습니다.' }, { status: 404 });
    }
    const existing = await prisma.curationItem.findFirst({
      where: { productId },
    });
    if (existing) {
      return NextResponse.json({ error: '이미 큐레이션에 포함된 상품입니다.' }, { status: 400 });
    }
    const maxOrder = await prisma.curationItem.aggregate({ _max: { sortOrder: true } });
    const sortOrder = (maxOrder._max.sortOrder ?? -1) + 1;
    const item = await prisma.curationItem.create({
      data: { productId, sortOrder },
      include: {
        product: {
          select: { id: true, name: true, basePrice: true, images: { where: { type: 'main' }, take: 1 } },
        },
      },
    });
    return NextResponse.json(item);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: '추가 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

/** 관리자: 큐레이션 순서 일괄 저장 */
export async function PATCH(request) {
  const admin = getAdminFromRequest(request);
  if (!admin) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }
  try {
    const body = await request.json();
    const { order } = body;
    if (!Array.isArray(order) || order.length === 0) {
      return NextResponse.json({ error: 'order 배열이 필요합니다.' }, { status: 400 });
    }
    await prisma.$transaction(
      order.map((id, index) =>
        prisma.curationItem.update({
          where: { id },
          data: { sortOrder: index },
        })
      )
    );
    const list = await prisma.curationItem.findMany({
      orderBy: { sortOrder: 'asc' },
      include: { product: { select: { id: true, name: true } } },
    });
    return NextResponse.json(list);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: '순서 저장 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
