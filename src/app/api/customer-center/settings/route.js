import { NextResponse } from 'next/server';
import { getOneToOneInquirySettings } from '@/lib/site-settings';

/** 고객센터 설정 (1:1 문의 등) - 공개 */
export async function GET() {
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
