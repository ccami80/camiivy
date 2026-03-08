'use client';

import { useParams } from 'next/navigation';
import ProductDetail from '@/components/product/ProductDetail';

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params?.id;

  return <ProductDetail productId={productId} />;
}
