import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getPartnerFromRequest } from '@/lib/partner-auth';

/** 입점업체 자신의 상품 단건 조회 (자신의 상품만 가능) */
export async function GET(request, context) {
  const payload = getPartnerFromRequest(request);
  if (!payload) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }
  const params = await Promise.resolve(context.params);
  const id = params?.id;
  if (!id) {
    return NextResponse.json({ error: '상품 ID가 필요합니다.' }, { status: 400 });
  }
  try {
    const partner = await prisma.partner.findUnique({
      where: { id: payload.sub },
    });
    if (!partner) {
      return NextResponse.json({ error: '입점업체 정보를 찾을 수 없습니다.' }, { status: 401 });
    }
    const product = await prisma.product.findFirst({
      where: { id, partnerId: partner.id },
      include: {
        category: { select: { id: true, name: true, slug: true, petType: true } },
        images: { orderBy: [{ type: 'asc' }, { sortOrder: 'asc' }] },
        variants: true,
      },
    });
    if (!product) {
      return NextResponse.json({ error: '상품을 찾을 수 없습니다.' }, { status: 404 });
    }
    return NextResponse.json(product);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: '상품을 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/** 입점업체 자신의 상품 삭제 (자신의 상품만, 주문 내역이 있으면 삭제 불가) */
export async function DELETE(request, context) {
  const payload = getPartnerFromRequest(request);
  if (!payload) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }
  const params = await Promise.resolve(context.params);
  const id = params?.id;
  if (!id) {
    return NextResponse.json({ error: '상품 ID가 필요합니다.' }, { status: 400 });
  }
  try {
    const product = await prisma.product.findFirst({
      where: { id, partnerId: payload.sub },
      include: { _count: { select: { orderItems: true } } },
    });
    if (!product) {
      return NextResponse.json({ error: '상품을 찾을 수 없습니다.' }, { status: 404 });
    }
    if (product._count.orderItems > 0) {
      return NextResponse.json(
        { error: '주문 내역이 있는 상품은 삭제할 수 없습니다.' },
        { status: 400 }
      );
    }
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ message: '상품이 삭제되었습니다.' });
  } catch (e) {
    if (e.code === 'P2025') {
      return NextResponse.json({ error: '상품을 찾을 수 없습니다.' }, { status: 404 });
    }
    console.error(e);
    return NextResponse.json(
      { error: '삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/** 입점업체 자신의 상품 수정 (자신의 상품만 가능, approvalStatus는 관리자만 변경) */
export async function PATCH(request, context) {
  const payload = getPartnerFromRequest(request);
  if (!payload) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }
  const params = await Promise.resolve(context.params);
  const id = params?.id;
  if (!id) {
    return NextResponse.json({ error: '상품 ID가 필요합니다.' }, { status: 400 });
  }
  try {
    const partner = await prisma.partner.findUnique({
      where: { id: payload.sub },
    });
    if (!partner) {
      return NextResponse.json({ error: '입점업체 정보를 찾을 수 없습니다.' }, { status: 401 });
    }
    const existing = await prisma.product.findFirst({
      where: { id, partnerId: partner.id },
      include: { images: true },
    });
    if (!existing) {
      return NextResponse.json({ error: '상품을 찾을 수 없습니다.' }, { status: 404 });
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
      detailContent,
      detailTemplateType,
    } = body;

    // 상세 콘텐츠만 업데이트하는 경우 (AI 생성 후 저장)
    if (body.name === undefined && (body.detailContent !== undefined || body.detailTemplateType !== undefined)) {
      const detailData = {};
      if (body.detailContent !== undefined) {
        detailData.detailContent = body.detailContent ? String(body.detailContent).trim() : null;
      }
      if (body.detailTemplateType !== undefined) {
        detailData.detailTemplateType = body.detailTemplateType ? String(body.detailTemplateType).trim() : null;
      }
      await prisma.product.update({ where: { id }, data: detailData });
      const updated = await prisma.product.findUnique({
        where: { id },
        include: {
          category: { select: { name: true } },
          images: { orderBy: { sortOrder: 'asc' } },
        },
      });
      return NextResponse.json(updated);
    }

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

    const updateData = {
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
    };
    if (detailContent !== undefined) {
      updateData.detailContent = detailContent ? String(detailContent).trim() : null;
    }
    if (detailTemplateType !== undefined) {
      updateData.detailTemplateType = detailTemplateType ? String(detailTemplateType).trim() : null;
    }
    await prisma.product.update({
      where: { id },
      data: updateData,
    });

    // 사이즈별 가격: sizePrices = { "S": 10000, "M": 12000 } → variant당 priceAdjust = 가격 - basePrice
    if (sizePrices != null && typeof sizePrices === 'object') {
      await prisma.productVariant.deleteMany({ where: { productId: id } });
      const base = Math.floor(price);
      for (const [optionLabel, salePrice] of Object.entries(sizePrices)) {
        const label = String(optionLabel).trim();
        if (!label) continue;
        const p = Number(salePrice);
        const priceAdjust = Number.isNaN(p) ? 0 : Math.floor(p) - base;
        await prisma.productVariant.create({
          data: {
            productId: id,
            optionLabel: label,
            priceAdjust,
            quantity: 0,
          },
        });
      }
    }

    if (Array.isArray(mainImageUrls) || Array.isArray(detailImageUrls)) {
      await prisma.productImage.deleteMany({ where: { productId: id } });
      const mainUrls = Array.isArray(mainImageUrls) ? mainImageUrls : [];
      const detailUrls = Array.isArray(detailImageUrls) ? detailImageUrls : [];
      for (let i = 0; i < mainUrls.length; i++) {
        await prisma.productImage.create({
          data: {
            productId: id,
            url: String(mainUrls[i]),
            type: 'main',
            sortOrder: i,
          },
        });
      }
      for (let i = 0; i < detailUrls.length; i++) {
        await prisma.productImage.create({
          data: {
            productId: id,
            url: String(detailUrls[i]),
            type: 'detail',
            sortOrder: i,
          },
        });
      }
    }

    const updated = await prisma.product.findUnique({
      where: { id },
      include: {
        category: { select: { name: true } },
        images: { orderBy: { sortOrder: 'asc' } },
      },
    });
    return NextResponse.json(updated);
  } catch (e) {
    if (e.code === 'P2025') {
      return NextResponse.json({ error: '상품을 찾을 수 없습니다.' }, { status: 404 });
    }
    console.error(e);
    return NextResponse.json(
      { error: '수정 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
