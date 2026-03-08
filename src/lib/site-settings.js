import { prisma } from '@/lib/prisma';

const KEYS = {
  ONE_TO_ONE_INQUIRY_URL: 'one_to_one_inquiry_url',
  ONE_TO_ONE_INQUIRY_TITLE: 'one_to_one_inquiry_title',
  ONE_TO_ONE_INQUIRY_DESCRIPTION: 'one_to_one_inquiry_description',
};

export async function getSetting(key) {
  const row = await prisma.siteSetting.findUnique({ where: { key } });
  return row?.value ?? null;
}

export async function setSetting(key, value) {
  const str = value != null ? String(value).trim() || null : null;
  await prisma.siteSetting.upsert({
    where: { key },
    create: { key, value: str ?? '' },
    update: { value: str ?? '' },
  });
}

export async function getOneToOneInquirySettings() {
  const [url, title, description] = await Promise.all([
    getSetting(KEYS.ONE_TO_ONE_INQUIRY_URL),
    getSetting(KEYS.ONE_TO_ONE_INQUIRY_TITLE),
    getSetting(KEYS.ONE_TO_ONE_INQUIRY_DESCRIPTION),
  ]);
  return {
    oneToOneInquiryUrl: url || '',
    oneToOneInquiryTitle: title || '1:1 문의',
    oneToOneInquiryDescription: description || '',
  };
}

export async function setOneToOneInquirySettings(data) {
  const url = data?.oneToOneInquiryUrl != null ? String(data.oneToOneInquiryUrl).trim() : null;
  const title = data?.oneToOneInquiryTitle != null ? String(data.oneToOneInquiryTitle).trim() : null;
  const description = data?.oneToOneInquiryDescription != null ? String(data.oneToOneInquiryDescription).trim() : null;
  await Promise.all([
    setSetting(KEYS.ONE_TO_ONE_INQUIRY_URL, url ?? ''),
    setSetting(KEYS.ONE_TO_ONE_INQUIRY_TITLE, title ?? '1:1 문의'),
    setSetting(KEYS.ONE_TO_ONE_INQUIRY_DESCRIPTION, description ?? ''),
  ]);
}
