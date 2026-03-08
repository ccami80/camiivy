import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getPartnerFromRequest } from '@/lib/partner-auth';

export async function GET(request) {
  const payload = getPartnerFromRequest(request);
  if (!payload) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }
  try {
    const partner = await prisma.partner.findUnique({
      where: { id: payload.sub },
    });
    if (!partner) {
      return NextResponse.json({ error: '입점업체 정보를 찾을 수 없습니다.' }, { status: 401 });
    }
    const products = await prisma.product.findMany({
      where: { partnerId: partner.id },
      orderBy: { createdAt: 'desc' },
      include: {
        category: { select: { name: true } },
        images: { where: { type: 'main' }, orderBy: { sortOrder: 'asc' }, take: 1 },
      },
    });
    return NextResponse.json(products);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: '목록을 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  const payload = getPartnerFromRequest(request);
  if (!payload) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }
  try {
    const partner = await prisma.partner.findUnique({
      where: { id: payload.sub },
    });
    if (!partner) {
      return NextResponse.json({ error: '입점업체 정보를 찾을 수 없습니다.' }, { status: 401 });
    }
    if (partner.status !== 'APPROVED') {
      return NextResponse.json(
        { error: '승인된 입점업체만 상품을 등록할 수 있습니다.' },
        { status: 403 }
      );
    }
    const body = await request.json();
    const {
      name,
      modelName,
      brand,
      petType,
      categoryId,
      basePrice,
      totalStock,
      description,
      shippingMethod,
      shippingPeriod,
      shippingNote,
      shippingFee,
      manufacturer,
      countryOfOrigin,
      returnAddress,
      sizeOption,
      colorOption,
      sizePrices,
      mainImageUrls,
      detailImageUrls,
    } = body;
    const brandTrim = brand != null ? String(brand).trim() : '';
    if (!name || !brandTrim || !categoryId || basePrice == null) {
      return NextResponse.json(
        { error: '상품명, 브랜드, 카테고리, 가격은 필수입니다.' },
        { status: 400 }
      );
    }
    const price = Number(basePrice);
    if (Number.isNaN(price) || price < 0) {
      return NextResponse.json({ error: '가격은 0 이상의 숫자여야 합니다.' }, { status: 400 });
    }
    const stock = totalStock != null ? Number(totalStock) : 0;
    if (Number.isNaN(stock) || stock < 0) {
      return NextResponse.json({ error: '재고는 0 이상의 숫자여야 합니다.' }, { status: 400 });
    }
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });
    if (!category) {
      return NextResponse.json({ error: '존재하지 않는 카테고리입니다.' }, { status: 400 });
    }
    if (category.petType === 'CAT') {
      return NextResponse.json({ error: '고양이 카테고리는 선택할 수 없습니다.' }, { status: 400 });
    }
    const shippingFeeNum = shippingFee != null ? Number(shippingFee) : null;
    // 등록된 상품은 관리자 승인 대기(PENDING) 상태로 저장. 승인 후에만 공개 API에 노출.
    const product = await prisma.product.create({
      data: {
        partnerId: partner.id,
        name: String(name).trim(),
        modelName: modelName ? String(modelName).trim() : null,
        brand: brandTrim,
        petType: 'DOG',
        categoryId,
        basePrice: Math.floor(price),
        totalStock: Math.floor(stock),
        description: description ? String(description).trim() : null,
        shippingMethod: shippingMethod ? String(shippingMethod).trim() : null,
        shippingPeriod: shippingPeriod ? String(shippingPeriod).trim() : null,
        shippingNote: shippingNote ? String(shippingNote).trim() : null,
        shippingFee: shippingFeeNum != null && !Number.isNaN(shippingFeeNum) && shippingFeeNum >= 0 ? Math.floor(shippingFeeNum) : null,
        manufacturer: manufacturer ? String(manufacturer).trim() : null,
        countryOfOrigin: countryOfOrigin ? String(countryOfOrigin).trim() : null,
        returnAddress: returnAddress ? String(returnAddress).trim() : null,
        sizeOption: sizeOption ? String(sizeOption).trim() : null,
        colorOption: colorOption ? String(colorOption).trim() : null,
        approvalStatus: 'PENDING',
      },
      include: {
        category: { select: { name: true } },
        images: true,
      },
    });
    // 사이즈별 가격: sizePrices = { "S": 10000, "M": 12000 } → variant당 priceAdjust = 가격 - basePrice
    if (sizePrices != null && typeof sizePrices === 'object' && Object.keys(sizePrices).length > 0) {
      const base = Math.floor(price);
      for (const [optionLabel, salePrice] of Object.entries(sizePrices)) {
        const label = String(optionLabel).trim();
        if (!label) continue;
        const p = Number(salePrice);
        const priceAdjust = Number.isNaN(p) ? 0 : Math.floor(p) - base;
        await prisma.productVariant.create({
          data: {
            productId: product.id,
            optionLabel: label,
            priceAdjust,
            quantity: 0,
          },
        });
      }
    }

    const mainUrls = Array.isArray(mainImageUrls) ? mainImageUrls : [];
    const detailUrls = Array.isArray(detailImageUrls) ? detailImageUrls : [];
    for (let i = 0; i < mainUrls.length; i++) {
      await prisma.productImage.create({
        data: {
          productId: product.id,
          url: String(mainUrls[i]),
          type: 'main',
          sortOrder: i,
        },
      });
    }
    for (let i = 0; i < detailUrls.length; i++) {
      await prisma.productImage.create({
        data: {
          productId: product.id,
          url: String(detailUrls[i]),
          type: 'detail',
          sortOrder: i,
        },
      });
    }
    const withImages = await prisma.product.findUnique({
      where: { id: product.id },
      include: {
        category: { select: { name: true } },
        images: { orderBy: { sortOrder: 'asc' } },
      },
    });
    return NextResponse.json(withImages);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: '상품 등록 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
