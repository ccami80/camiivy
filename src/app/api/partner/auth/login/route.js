import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword, signPartnerToken } from '@/lib/auth';

/**
 * 파트너(입점업체) 전용 로그인.
 * 승인된 파트너(status === APPROVED)만 토큰 발급. 미승인 시 로그인 차단.
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body;
    if (!email || !password) {
      return NextResponse.json(
        { error: '이메일과 비밀번호를 입력해 주세요.' },
        { status: 400 }
      );
    }
    const partner = await prisma.partner.findUnique({
      where: { email: email.trim() },
    });
    if (!partner || !verifyPassword(password, partner.passwordHash)) {
      return NextResponse.json(
        { error: '이메일 또는 비밀번호가 올바르지 않습니다.' },
        { status: 401 }
      );
    }
    if (partner.status !== 'APPROVED') {
      return NextResponse.json(
        { error: '승인된 입점업체만 로그인할 수 있습니다. 승인 대기 중이면 관리자 승인 후 이용해 주세요.' },
        { status: 403 }
      );
    }
    const token = signPartnerToken(partner);
    return NextResponse.json({
      token,
      partner: {
        id: partner.id,
        email: partner.email,
        companyName: partner.companyName,
        status: partner.status,
      },
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: '로그인 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
