/**
 * 고양이(CAT) 관련 카테고리·상품을 DB에서 제거하는 스크립트.
 * - 주문 이력이 있는 CAT 상품은 삭제하지 않습니다 (주문 보존).
 * 실행: node scripts/remove-cat-data.js
 * (프로젝트 루트에서 실행, .env 로 DB 연결)
 */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const catCategories = await prisma.category.findMany({
    where: { petType: 'CAT' },
    select: { id: true },
  });
  const catCategoryIds = catCategories.map((c) => c.id);

  const catProducts = await prisma.product.findMany({
    where: { petType: 'CAT' },
    select: { id: true },
  });
  const catProductIds = catProducts.map((p) => p.id);

  console.log('CAT 카테고리 수:', catCategoryIds.length);
  console.log('CAT 상품 수:', catProductIds.length);

  if (catCategoryIds.length === 0 && catProductIds.length === 0) {
    console.log('삭제할 CAT 데이터가 없습니다.');
    return;
  }

  // 1) 카테고리별 베스트에서 CAT 카테고리 항목 제거
  const delBest = await prisma.categoryBestItem.deleteMany({
    where: { categoryId: { in: catCategoryIds } },
  });
  console.log('CategoryBestItem 삭제:', delBest.count);

  // 2) 함께 구매 추천에서 CAT 상품 관련 제거
  const delRec = await prisma.productRecommended.deleteMany({
    where: {
      OR: [
        { productId: { in: catProductIds } },
        { recommendedProductId: { in: catProductIds } },
      ],
    },
  });
  console.log('ProductRecommended 삭제:', delRec.count);

  // 3) 큐레이션에서 CAT 상품 제거
  const delCur = await prisma.curationItem.deleteMany({
    where: { productId: { in: catProductIds } },
  });
  console.log('CurationItem 삭제:', delCur.count);

  // 4) 장바구니에서 CAT 상품 제거
  const delCart = await prisma.cartItem.deleteMany({
    where: { productId: { in: catProductIds } },
  });
  console.log('CartItem 삭제:', delCart.count);

  // 5) 주문 이력이 없는 CAT 상품만 삭제 (있으면 건너뜀)
  let deletedProducts = 0;
  for (const id of catProductIds) {
    const orderCount = await prisma.orderItem.count({ where: { productId: id } });
    if (orderCount === 0) {
      await prisma.product.delete({ where: { id } });
      deletedProducts++;
    }
  }
  console.log('주문 없는 CAT 상품 삭제:', deletedProducts);

  // 6) CAT 카테고리 삭제 (상품이 남아 있는 카테고리는 Product.categoryId FK 때문에 실패할 수 있음)
  const remainingCatProducts = await prisma.product.count({
    where: { categoryId: { in: catCategoryIds } },
  });
  if (remainingCatProducts > 0) {
    console.log('주문 이력이 있어 남겨둔 CAT 상품이 있어, 해당 카테고리는 삭제하지 않습니다.');
  } else {
    const delCat = await prisma.category.deleteMany({
      where: { petType: 'CAT' },
    });
    console.log('Category 삭제:', delCat.count);
  }

  console.log('완료.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
