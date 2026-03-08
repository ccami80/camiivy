import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/user-auth';

/** 내 반려동물 목록 */
export async function GET(request) {
  const payload = getUserFromRequest(request);
  if (!payload) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  }
  try {
    const list = await prisma.pet.findMany({
      where: { userId: payload.sub },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(list);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: '조회 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

/** 반려동물 추가 */
export async function POST(request) {
  const payload = getUserFromRequest(request);
  if (!payload) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  }
  try {
    const body = await request.json();
    const { name, petType, breed, bodyType, birthDate } = body;
    if (!name || !petType) {
      return NextResponse.json({ error: '이름과 반려동물 종류는 필수입니다.' }, { status: 400 });
    }
    if (!['DOG', 'CAT'].includes(petType)) {
      return NextResponse.json({ error: '반려동물 종류는 DOG 또는 CAT입니다.' }, { status: 400 });
    }
    const pet = await prisma.pet.create({
      data: {
        userId: payload.sub,
        name: String(name).trim(),
        petType,
        breed: breed ? String(breed).trim() : null,
        bodyType: bodyType ? String(bodyType).trim() : null,
        birthDate: birthDate ? new Date(birthDate) : null,
      },
    });
    return NextResponse.json(pet);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: '등록 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
