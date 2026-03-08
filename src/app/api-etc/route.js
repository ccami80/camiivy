import { NextResponse } from 'next/server';

/** api-etc 루트: 타사 API 엔드포인트는 /api-etc/... 하위 경로 사용 */
export async function GET() {
  return NextResponse.json({
    description: 'Third-party API routes. Use specific paths under /api-etc/.',
  });
}
