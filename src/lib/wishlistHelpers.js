/** 상품 객체에서 위시리스트 항목용 { id, name, imageUrl, basePrice } 추출 */
export function wishlistEntryFromProduct(product) {
  if (!product?.id) return null;
  const mainImages = (product.images || [])
    .filter((i) => i.type === 'main')
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  const imageUrl = mainImages[0]?.url ?? product.images?.[0]?.url ?? null;
  return {
    id: String(product.id),
    name: product.name || '',
    imageUrl,
    basePrice: product.basePrice ?? undefined,
  };
}
