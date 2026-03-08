import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, signUserToken } from '@/lib/auth';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password, name, phone } = body;
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: '이메일, 비밀번호, 이름은 필수입니다.' },
        { status: 400 }
      );
    }
    const trimmedEmail = email.trim();
    const trimmedName = name.trim();
    if (password.length < 6) {
      return NextResponse.json(
        { error: '비밀번호는 6자 이상이어야 합니다.' },
        { status: 400 }
      );
    }
    const existing = await prisma.user.findUnique({
      where: { email: trimmedEmail },
    });
    if (existing) {
      return NextResponse.json(
        { error: '이미 사용 중인 이메일입니다.' },
        { status: 400 }
      );
    }
    const user = await prisma.user.create({
      data: {
        email: trimmedEmail,
        passwordHash: hashPassword(password),
        name: trimmedName,
        phone: phone != null ? String(phone).trim() || null : null,
      },
    });
    const token = signUserToken(user);
    return NextResponse.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
      },
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: '회원가입 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
