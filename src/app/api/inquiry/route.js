import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/user-auth';

const MAX_CONTENT_LENGTH = 4000;
const INQUIRY_TYPES = [
  '취소/환불',
  '배송',
  '교환/반품',
  '상품',
  '회원/로그인',
  '기타',
];

const INQUIRY_TYPES_REQUIRE_ORDER = ['취소/환불', '배송', '교환/반품', '상품'];

/** 1:1 문의 등록 (로그인 시 회원 연동) */
export async function POST(request) {
  try {
    const user = getUserFromRequest(request);
    const body = await request.json();
    const {
      inquiryType,
      orderId,
      orderNumber,
      orderPhone,
      content,
      imageUrls,
      notifySms,
      notifyEmail,
      phone,
      email,
    } = body;

    const typeTrim = inquiryType != null ? String(inquiryType).trim() : '';
    if (!typeTrim || !INQUIRY_TYPES.includes(typeTrim)) {
      return NextResponse.json(
        { error: '문의유형을 선택해 주세요.' },
        { status: 400 }
      );
    }

    if (INQUIRY_TYPES_REQUIRE_ORDER.includes(typeTrim)) {
      const oid = orderId != null ? String(orderId).trim() || null : null;
      if (!oid) {
        return NextResponse.json(
          { error: '문의하실 주문정보를 선택해 주세요.' },
          { status: 400 }
        );
      }
      const exists = await prisma.order.findUnique({ where: { id: oid }, select: { id: true } });
      if (!exists) {
        return NextResponse.json(
          { error: '선택한 주문을 찾을 수 없습니다.' },
          { status: 400 }
        );
      }
    }

    const contentTrim = content != null ? String(content).trim() : '';
    if (!contentTrim) {
      return NextResponse.json(
        { error: '문의 내용을 입력해 주세요.' },
        { status: 400 }
      );
    }
    if (contentTrim.length > MAX_CONTENT_LENGTH) {
      return NextResponse.json(
        { error: `문의 내용은 ${MAX_CONTENT_LENGTH}자 이하여야 합니다.` },
        { status: 400 }
      );
    }

    const urls = Array.isArray(imageUrls) ? imageUrls.slice(0, 3) : [];
    const imageUrlsJson = urls.length ? JSON.stringify(urls) : null;

    const sms = Boolean(notifySms);
    const emailNotif = Boolean(notifyEmail);
    const phoneVal = phone != null ? String(phone).trim() || null : null;
    const emailVal = email != null ? String(email).trim() || null : null;
    const orderIdVal = orderId != null ? String(orderId).trim() || null : null;
    const orderNumberVal = orderNumber != null ? String(orderNumber).trim() || null : null;
    const orderPhoneVal = orderPhone != null ? String(orderPhone).trim() || null : null;

    await prisma.oneToOneInquiry.create({
      data: {
        userId: user?.sub ?? null,
        category: 'CUSTOMER_SERVICE',
        inquiryType: typeTrim,
        orderId: orderIdVal,
        orderNumber: orderNumberVal,
        orderPhone: orderPhoneVal,
        content: contentTrim,
        imageUrls: imageUrlsJson,
        notifySms: sms,
        notifyEmail: emailNotif,
        phone: phoneVal,
        email: emailVal,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: '문의 등록 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
