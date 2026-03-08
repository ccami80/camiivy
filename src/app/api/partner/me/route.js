import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getPartnerFromRequest } from '@/lib/partner-auth';

export async function GET(request) {
  const payload = getPartnerFromRequest(request);
  if (!payload) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }
  try {
    const partner = await prisma.partner.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        companyName: true,
        businessNumber: true,
        contactName: true,
        contactPhone: true,
        status: true,
        createdAt: true,
      },
    });
    if (!partner) {
      return NextResponse.json({ error: '입점업체 정보를 찾을 수 없습니다.' }, { status: 401 });
    }
    return NextResponse.json({ partner });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: '조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/** 업체 정보 수정. 사업자등록번호·업체명 변경 시 status → PENDING(재승인 필요) */
export async function PATCH(request) {
  const payload = getPartnerFromRequest(request);
  if (!payload) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }
  try {
    const body = await request.json();
    const { companyName, contactName, contactPhone } = body;
    const partnerId = payload.sub;
    // 사업자등록번호는 수정 불가(변경 시 재승인 없이 차단)

    const current = await prisma.partner.findUnique({
      where: { id: partnerId },
      select: { companyName: true },
    });
    if (!current) {
      return NextResponse.json({ error: '입점업체 정보를 찾을 수 없습니다.' }, { status: 401 });
    }

    const data = {};
    if (companyName !== undefined) data.companyName = String(companyName).trim();
    if (contactName !== undefined) data.contactName = String(contactName).trim();
    if (contactPhone !== undefined) data.contactPhone = String(contactPhone).trim();

    const companyNameChanged =
      data.companyName !== undefined && data.companyName !== current.companyName;
    if (companyNameChanged) {
      data.status = 'PENDING';
    }

    const partner = await prisma.partner.update({
      where: { id: partnerId },
      data,
      select: {
        id: true,
        email: true,
        companyName: true,
        businessNumber: true,
        contactName: true,
        contactPhone: true,
        status: true,
      },
    });
    return NextResponse.json({
      partner,
      requiresReapproval: companyNameChanged,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: '정보 수정 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
