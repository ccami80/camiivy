import { NextResponse } from 'next/server';
import { mockBanners } from '@/mocks/data';

/** 목업: 배너 목록 (실제 API는 src/app/api/banners) */
export async function GET() {
  return NextResponse.json(mockBanners);
}
