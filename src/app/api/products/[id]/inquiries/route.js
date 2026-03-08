import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/user-auth';

/** 상품 문의 목록 (공개). 비밀글은 "비밀글입니다"만 표시 */
export async function GET(request, context) {
  try {
    const params = await Promise.resolve(context.params);
    const productId = params?.id;
    if (!productId) {
      return NextResponse.json({ error: '상품 ID가 필요합니다.' }, { status: 400 });
    }

    const product = await prisma.product.findFirst({
      where: { id: productId, approvalStatus: 'APPROVED' },
      select: { id: true },
    });
    if (!product) {
      return NextResponse.json({ error: '상품을 찾을 수 없습니다.' }, { status: 404 });
    }

    const payload = getUserFromRequest(request);
    const inquiries = await prisma.productInquiry.findMany({
      where: { productId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true } },
      },
    });

    const list = inquiries.map((inq) => {
      const isAuthor = payload && inq.userId && String(inq.userId) === String(payload.sub);
      const showContent = !inq.secret || isAuthor;
      return {
        id: inq.id,
        title: inq.title,
        content: showContent ? inq.content : null,
        secret: inq.secret,
        maskedContent: inq.secret && !showContent,
        writerName: inq.user?.name ? (inq.user.name.length <= 2 ? inq.user.name[0] + '*' : inq.user.name[0] + '*'.repeat(inq.user.name.length - 2) + inq.user.name[inq.user.name.length - 1]) : '비회원',
        answer: inq.answer,
        answeredAt: inq.answeredAt,
        createdAt: inq.createdAt,
      };
    });

    return NextResponse.json({ inquiries: list });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: '문의 목록을 불러오는 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

/** 상품 문의 등록 (비회원 가능, 로그인 시 userId 저장). 상품이 존재하면 문의 허용 */
export async function POST(request, context) {
  try {
    const params = await Promise.resolve(context.params);
    const productId = params?.id;
    if (!productId) {
      return NextResponse.json({ error: '상품 ID가 필요합니다.' }, { status: 400 });
    }

    const product = await prisma.product.findFirst({
      where: { id: productId },
      select: { id: true },
    });
    if (!product) {
      return NextResponse.json({ error: '상품을 찾을 수 없습니다.' }, { status: 404 });
    }

    const body = await request.json().catch(() => ({}));
    const title = typeof body.title === 'string' ? body.title.trim() : '';
    const content = typeof body.content === 'string' ? body.content.trim() : '';
    if (!title || !content) {
      return NextResponse.json({ error: '제목과 내용을 입력해 주세요.' }, { status: 400 });
    }

    const payload = getUserFromRequest(request);
    const inquiry = await prisma.productInquiry.create({
      data: {
        productId,
        userId: payload?.sub ?? null,
        title: title.slice(0, 200),
        content,
        emailReply: Boolean(body.emailReply),
        secret: Boolean(body.secret),
      },
    });

    return NextResponse.json({ id: inquiry.id, message: '문의가 등록되었습니다.' });
  } catch (e) {
    console.error('Product inquiry POST error:', e);
    const message = e?.message || '문의 등록에 실패했습니다.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
