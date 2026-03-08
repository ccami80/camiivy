/**
 * AI 기반 상품 상세 콘텐츠 생성.
 * OPENAI_API_KEY가 있으면 OpenAI 사용, 없으면 템플릿 기반 폴백.
 */

export const DETAIL_TEMPLATE_TYPES = {
  PREMIUM_LIFESTYLE: 'premium_lifestyle',   // 1. 프리미엄 라이프스타일형
  FUNCTION_PERSUASIVE: 'function_persuasive', // 2. 기능 중심 설득형
  EMOTIONAL_EMPATHY: 'emotional_empathy',   // 3. 감성 공감형
};

const TEMPLATE_LABELS = {
  [DETAIL_TEMPLATE_TYPES.PREMIUM_LIFESTYLE]: '프리미엄 라이프스타일형',
  [DETAIL_TEMPLATE_TYPES.FUNCTION_PERSUASIVE]: '기능 중심 설득형',
  [DETAIL_TEMPLATE_TYPES.EMOTIONAL_EMPATHY]: '감성 공감형',
};

function buildPrompt(templateType, product, inputSummary) {
  const name = product?.name || '상품';
  const description = product?.description || '';
  const base = `다음 반려동물 상품의 상세 페이지용 HTML을 한 편 작성해줘. 상품명: ${name}. ${description ? `기본 설명: ${description.slice(0, 300)}` : ''}. 작성 시 참고할 추가 입력: ${inputSummary || '(없음)'}.`;
  const instructions = {
    [DETAIL_TEMPLATE_TYPES.PREMIUM_LIFESTYLE]: '고급스러운 라이프스타일과 프리미엄 품질을 강조하는 톤으로, 세련된 문구와 품격 있는 구성을 사용해줘. HTML만 출력하고 다른 설명은 넣지 마.',
    [DETAIL_TEMPLATE_TYPES.FUNCTION_PERSUASIVE]: '기능과 사양, 사용 효과를 명확히 제시하고 구매 이유를 설득하는 톤으로 작성해줘. HTML만 출력하고 다른 설명은 넣지 마.',
    [DETAIL_TEMPLATE_TYPES.EMOTIONAL_EMPATHY]: '반려동물과의 관계, 감성적 공감, 사랑과 케어를 강조하는 따뜻한 톤으로 작성해줘. HTML만 출력하고 다른 설명은 넣지 마.',
  };
  return base + ' ' + (instructions[templateType] || instructions[DETAIL_TEMPLATE_TYPES.PREMIUM_LIFESTYLE]);
}

/** OPENAI_API_KEY 사용 시 OpenAI로 생성 */
async function generateWithOpenAI(prompt) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `OpenAI API error: ${res.status}`);
  }
  const data = await res.json();
  const text = data.choices?.[0]?.message?.content?.trim() || '';
  return text.replace(/^```html?\s*/i, '').replace(/\s*```\s*$/i, '').trim();
}

/** API 키 없을 때 템플릿 기반 HTML 생성 (수정 가능한 기본 콘텐츠) */
function generateFallback(templateType, product, inputSummary) {
  const name = product?.name || '상품';
  const desc = product?.description || inputSummary || '상품을 소개합니다.';
  const safe = (s) => String(s).replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const sections = {
    [DETAIL_TEMPLATE_TYPES.PREMIUM_LIFESTYLE]: `
      <section class="detail-section" style="margin-bottom:2rem;">
        <h2 style="font-size:1.25rem;font-weight:600;margin-bottom:1rem;">프리미엄 라이프스타일</h2>
        <p style="line-height:1.7;color:#374151;">${safe(name)}과 함께하는 품격 있는 일상. 프리미엄 품질이 만드는 특별한 경험을 전합니다.</p>
        <p style="line-height:1.7;color:#6b7280;margin-top:1rem;">${safe(desc.slice(0, 400))}</p>
      </section>
    `,
    [DETAIL_TEMPLATE_TYPES.FUNCTION_PERSUASIVE]: `
      <section class="detail-section" style="margin-bottom:2rem;">
        <h2 style="font-size:1.25rem;font-weight:600;margin-bottom:1rem;">제품 특징</h2>
        <p style="line-height:1.7;color:#374151;">${safe(name)}의 핵심 기능과 사용 효과를 소개합니다.</p>
        <p style="line-height:1.7;color:#6b7280;margin-top:1rem;">${safe(desc.slice(0, 400))}</p>
      </section>
    `,
    [DETAIL_TEMPLATE_TYPES.EMOTIONAL_EMPATHY]: `
      <section class="detail-section" style="margin-bottom:2rem;">
        <h2 style="font-size:1.25rem;font-weight:600;margin-bottom:1rem;">함께하는 순간</h2>
        <p style="line-height:1.7;color:#374151;">${safe(name)}은(는) 반려동물과의 소중한 시간을 위한 선택입니다.</p>
        <p style="line-height:1.7;color:#6b7280;margin-top:1rem;">${safe(desc.slice(0, 400))}</p>
      </section>
    `,
  };
  const section = sections[templateType] || sections[DETAIL_TEMPLATE_TYPES.PREMIUM_LIFESTYLE];
  return `<div class="ai-detail-content">${section}<p style="margin-top:1.5rem;font-size:0.875rem;color:#9ca3af;">※ 생성된 콘텐츠는 수정 후 저장할 수 있습니다.</p></div>`;
}

/**
 * 상품 상세 HTML 생성. templateType, product, inputSummary 사용.
 * @returns { Promise<{ content: string, templateType: string }> }
 */
export async function generateDetailContent(templateType, product, inputSummary) {
  const valid = Object.values(DETAIL_TEMPLATE_TYPES).includes(templateType);
  const type = valid ? templateType : DETAIL_TEMPLATE_TYPES.PREMIUM_LIFESTYLE;
  const prompt = buildPrompt(type, product, inputSummary);

  try {
    const content = await generateWithOpenAI(prompt);
    if (content) return { content, templateType: type };
  } catch (e) {
    console.warn('OpenAI fallback:', e.message);
  }
  const fallback = generateFallback(type, product, inputSummary);
  return { content: fallback, templateType: type };
}

export function getTemplateLabel(templateType) {
  return TEMPLATE_LABELS[templateType] || templateType;
}
