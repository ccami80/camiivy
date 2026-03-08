import { NextResponse } from 'next/server';
import { mockProducts } from '@/mocks/data';

/** 목업: 상품 목록 (실제 API는 src/app/api/products) */
export async function GET() {
  return NextResponse.json(mockProducts);
}
