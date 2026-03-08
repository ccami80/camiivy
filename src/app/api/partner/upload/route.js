import { NextResponse } from 'next/server';
import { getPartnerFromRequest } from '@/lib/partner-auth';
import { prisma } from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(request) {
  const payload = getPartnerFromRequest(request);
  if (!payload) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }
  const partner = await prisma.partner.findUnique({
    where: { id: payload.sub },
  });
  if (!partner || partner.status !== 'APPROVED') {
    return NextResponse.json(
      { error: '승인된 입점업체만 업로드할 수 있습니다.' },
      { status: 403 }
    );
  }
  try {
    const formData = await request.formData();
    const files = formData.getAll('files');
    const fileList = Array.isArray(files) ? files : files ? [files] : [];
    if (fileList.length === 0) {
      return NextResponse.json(
        { error: '업로드할 이미지를 선택해 주세요.' },
        { status: 400 }
      );
    }
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadDir, { recursive: true });
    const urls = [];
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      if (!file || typeof file.arrayBuffer !== 'function') continue;
      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json(
          { error: 'JPEG, PNG, WebP, GIF 이미지만 업로드 가능합니다.' },
          { status: 400 }
        );
      }
      if (file.size > MAX_SIZE) {
        return NextResponse.json(
          { error: '파일 크기는 5MB 이하여야 합니다.' },
          { status: 400 }
        );
      }
      const ext = path.extname(file.name) || (file.type === 'image/png' ? '.png' : '.jpg');
      const name = `${Date.now()}-${i}-${Math.random().toString(36).slice(2, 10)}${ext}`;
      const filePath = path.join(uploadDir, name);
      const buffer = Buffer.from(await file.arrayBuffer());
      await writeFile(filePath, buffer);
      urls.push(`/uploads/${name}`);
    }
    return NextResponse.json({ urls });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: '업로드 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
