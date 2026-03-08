import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/** 상품별 리뷰 목록 (공개). 정렬: recent, rating_high, rating_low. 필터: bodyType, petType */
export async function GET(request, context) {
  try {
    const params = await context.params;
    const productId = params?.id;
    if (!productId) {
      return NextResponse.json({ error: '상품 ID가 필요합니다.' }, { status: 400 });
    }
    const { searchParams } = new URL(request.url);
    const sort = searchParams.get('sort') || 'recent';
    const bodyType = searchParams.get('bodyType') || '';
    const petType = searchParams.get('petType') || '';

    const where = { productId };
    if (bodyType && bodyType.trim()) where.bodyType = bodyType.trim();
    if (petType && (petType === 'DOG' || petType === 'CAT')) where.petType = petType;

    const orderBy =
      sort === 'rating_high'
        ? [{ rating: 'desc' }, { createdAt: 'desc' }]
        : sort === 'rating_low'
          ? [{ rating: 'asc' }, { createdAt: 'desc' }]
          : [{ createdAt: 'desc' }];

    const reviews = await prisma.review.findMany({
      where,
      orderBy,
      include: {
        user: {
          select: { name: true },
        },
      },
    });

    // 평점 분포: 5~1점 각각 개수 (이용자 평점 총 5점 중 X.X점, 평점 비율용)
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let sum = 0;
    reviews.forEach((r) => {
      const v = Math.min(5, Math.max(1, Number(r.rating) || 0));
      distribution[v] = (distribution[v] || 0) + 1;
      sum += v;
    });
    const count = reviews.length;
    const average = count > 0 ? Math.round((sum / count) * 10) / 10 : null;
    const summary = {
      average,
      count,
      distribution: { 5: distribution[5], 4: distribution[4], 3: distribution[3], 2: distribution[2], 1: distribution[1] },
    };

    const list = reviews.map((r) => {
      const name = r.user?.name || '회원';
      const maskedName = name.length <= 2 ? name[0] + '*' : name[0] + '*'.repeat(name.length - 2) + name[name.length - 1];
      let imageUrls = [];
      if (r.imageUrls) {
        try {
          imageUrls = JSON.parse(r.imageUrls);
        } catch (_) {}
      }
      return {
        id: r.id,
        rating: r.rating,
        content: r.content,
        bodyType: r.bodyType,
        petType: r.petType,
        imageUrls,
        createdAt: r.createdAt,
        writerName: maskedName,
      };
    });

    return NextResponse.json({ reviews: list, summary });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: '리뷰를 불러오는 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
