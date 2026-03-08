import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/user-auth';

/** 내 반려동물 수정 */
export async function PATCH(request, context) {
  const payload = getUserFromRequest(request);
  if (!payload) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  }
  const params = await context.params;
  const id = params?.id;
  if (!id) {
    return NextResponse.json({ error: 'ID가 필요합니다.' }, { status: 400 });
  }
  try {
    const existing = await prisma.pet.findFirst({
      where: { id, userId: payload.sub },
    });
    if (!existing) {
      return NextResponse.json({ error: '반려동물을 찾을 수 없습니다.' }, { status: 404 });
    }
    const body = await request.json();
    const { name, petType, breed, bodyType, birthDate } = body;
    const data = {};
    if (name !== undefined) data.name = String(name).trim();
    if (petType !== undefined) {
      if (!['DOG', 'CAT'].includes(petType)) {
        return NextResponse.json({ error: '반려동물 종류는 DOG 또는 CAT입니다.' }, { status: 400 });
      }
      data.petType = petType;
    }
    if (breed !== undefined) data.breed = breed ? String(breed).trim() : null;
    if (bodyType !== undefined) data.bodyType = bodyType ? String(bodyType).trim() : null;
    if (birthDate !== undefined) data.birthDate = birthDate ? new Date(birthDate) : null;
    const pet = await prisma.pet.update({
      where: { id },
      data,
    });
    return NextResponse.json(pet);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: '수정 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

/** 내 반려동물 삭제 */
export async function DELETE(request, context) {
  const payload = getUserFromRequest(request);
  if (!payload) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  }
  const params = await context.params;
  const id = params?.id;
  if (!id) {
    return NextResponse.json({ error: 'ID가 필요합니다.' }, { status: 400 });
  }
  try {
    const existing = await prisma.pet.findFirst({
      where: { id, userId: payload.sub },
    });
    if (!existing) {
      return NextResponse.json({ error: '반려동물을 찾을 수 없습니다.' }, { status: 404 });
    }
    await prisma.pet.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: '삭제 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
