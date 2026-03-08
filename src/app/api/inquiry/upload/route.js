import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

const ALLOWED_TYPES = ['image/jpeg', 'image/png'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_FILES = 3;

/** 1:1 문의 사진 첨부 업로드 (비로그인 가능) */
export async function POST(request) {
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
    if (fileList.length > MAX_FILES) {
      return NextResponse.json(
        { error: `최대 ${MAX_FILES}개까지 등록 가능합니다.` },
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
          { error: 'jpg, png 파일만 등록 가능합니다.' },
          { status: 400 }
        );
      }
      if (file.size > MAX_SIZE) {
        return NextResponse.json(
          { error: '파일 크기는 5MB 미만이어야 합니다.' },
          { status: 400 }
        );
      }
      const ext = file.type === 'image/png' ? '.png' : '.jpg';
      const name = `inquiry-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 10)}${ext}`;
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
