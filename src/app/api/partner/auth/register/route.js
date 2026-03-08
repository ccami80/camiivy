import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';

/** 입점업체(사업자) 회원가입. 승인 전까지 status = PENDING */
export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password, companyName, businessNumber, contactName, contactPhone } = body;
    if (!email || !password || !companyName || !businessNumber || !contactName || !contactPhone) {
      return NextResponse.json(
        { error: '이메일, 비밀번호, 업체명, 사업자등록번호, 담당자명, 연락처는 필수입니다.' },
        { status: 400 }
      );
    }
    const trimmedEmail = email.trim();
    if (password.length < 6) {
      return NextResponse.json(
        { error: '비밀번호는 6자 이상이어야 합니다.' },
        { status: 400 }
      );
    }
    const existing = await prisma.partner.findUnique({
      where: { email: trimmedEmail },
    });
    if (existing) {
      return NextResponse.json(
        { error: '이미 사용 중인 이메일입니다.' },
        { status: 400 }
      );
    }
    const partner = await prisma.partner.create({
      data: {
        email: trimmedEmail,
        passwordHash: hashPassword(password),
        companyName: String(companyName).trim(),
        businessNumber: String(businessNumber).trim().replace(/-/g, ''),
        contactName: String(contactName).trim(),
        contactPhone: String(contactPhone).trim(),
        status: 'PENDING',
      },
    });
    return NextResponse.json({
      message: '가입이 완료되었습니다. 관리자 승인 후 입점이 가능합니다.',
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
      { error: '회원가입 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
