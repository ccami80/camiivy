import { NextResponse } from 'next/server';
import { mockProducts } from '@/mocks/data';

/** 목업: 상품 상세 (실제 API는 src/app/api/products/[id]) */
export async function GET(request, { params }) {
  const id = params?.id;
  const product = mockProducts.find((p) => p.id === id) ?? mockProducts[0];
  return NextResponse.json({
    ...product,
    id: id ?? product.id,
    description: 'Mock product detail.',
  });
}
