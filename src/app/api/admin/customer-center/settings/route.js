import { NextResponse } from 'next/server';
import { getAdminFromRequest } from '@/lib/admin-auth';
import {
  getOneToOneInquirySettings,
  setOneToOneInquirySettings,
} from '@/lib/site-settings';

/** 관리자: 고객센터 설정 조회 (1:1 문의) */
export async function GET(request) {
  const admin = getAdminFromRequest(request);
  if (!admin) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }
  try {
    const settings = await getOneToOneInquirySettings();
    return NextResponse.json(settings);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: '설정을 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/** 관리자: 고객센터 설정 수정 (1:1 문의) */
export async function PATCH(request) {
  const admin = getAdminFromRequest(request);
  if (!admin) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }
  try {
    const body = await request.json();
    await setOneToOneInquirySettings(body);
    const settings = await getOneToOneInquirySettings();
    return NextResponse.json(settings);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: '설정 저장 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
