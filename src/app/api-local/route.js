import { NextResponse } from 'next/server';

/** api-local 루트: 프론트 자체해결 API는 /api-local/... 하위 경로 사용 */
export async function GET() {
  return NextResponse.json({
    description: 'Front-end self-handled API routes. Use specific paths under /api-local/.',
  });
}
