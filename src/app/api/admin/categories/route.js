import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminFromRequest } from '@/lib/admin-auth';

export async function GET(request) {
  const admin = getAdminFromRequest(request);
  if (!admin) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }
  try {
    const { searchParams } = new URL(request.url);
    const petType = searchParams.get('petType');
    if (petType === 'CAT') return NextResponse.json([]);
    const where = petType ? { petType } : { petType: { not: 'CAT' } };
    const categories = await prisma.category.findMany({
      where,
      orderBy: [
        { petType: 'asc' },
        { parentId: 'asc' },
        { sortOrder: 'asc' },
      ],
    });
    return NextResponse.json(categories);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: '카테고리 목록을 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  const admin = getAdminFromRequest(request);
  if (!admin) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }
  try {
    const body = await request.json();
    const { name, slug, petType, sortOrder, parentId } = body;
    const nameTrim = name != null ? String(name).trim() : '';
    const slugRaw = slug != null ? String(slug).trim() : '';
    if (!nameTrim || !petType) {
      return NextResponse.json(
        { error: '이름과 반려동물 타입은 필수입니다.' },
        { status: 400 }
      );
    }
    const slugTrim = (slugRaw || nameTrim.toLowerCase().replace(/\s+/g, '-')).toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9가-힣-]/g, '');
    if (!slugTrim) {
      return NextResponse.json(
        { error: 'slug를 입력하거나, 이름에 영문/숫자/한글을 넣어 주세요. (특수문자만 있으면 안 됨)' },
        { status: 400 }
      );
    }
    if (petType === 'CAT') {
      return NextResponse.json({ error: '고양이 카테고리는 더 이상 추가할 수 없습니다.' }, { status: 400 });
    }
    const resolvedPetType = 'DOG';
    let resolvedParentId = null;
    if (parentId && String(parentId).trim()) {
      const parent = await prisma.category.findFirst({
        where: { id: String(parentId).trim(), parentId: null },
      });
      if (!parent) {
        return NextResponse.json(
          { error: '선택한 상위 카테고리를 찾을 수 없습니다.' },
          { status: 400 }
        );
      }
      if (parent.petType !== resolvedPetType) {
        return NextResponse.json(
          { error: '상위 카테고리와 반려동물 타입이 같아야 합니다.' },
          { status: 400 }
        );
      }
      resolvedParentId = parent.id;
    }
    const category = await prisma.category.create({
      data: {
        name: nameTrim,
        slug: slugTrim,
        petType: resolvedPetType,
        sortOrder: sortOrder != null ? Number(sortOrder) : 0,
        parentId: resolvedParentId,
      },
    });
    return NextResponse.json(category);
  } catch (e) {
    if (e.code === 'P2002') {
      return NextResponse.json({ error: '이미 사용 중인 slug입니다. 다른 slug를 입력하세요.' }, { status: 400 });
    }
    console.error('Category POST error:', e);
    const message = e.message || '카테고리 추가 중 오류가 발생했습니다.';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
