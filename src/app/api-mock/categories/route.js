import { NextResponse } from 'next/server';
import { mockCategories } from '@/mocks/data';

/** 목업: 카테고리 목록 (실제 API는 src/app/api/categories) */
export async function GET() {
  return NextResponse.json(mockCategories);
}
