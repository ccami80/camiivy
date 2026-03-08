'use client';

/**
 * Template B – Functional Fit
 * Body-type fit explanation, material and feature highlights, structured layout with icons
 */
const FEATURES = [
  { title: '반사 소재', desc: '어두운 곳에서도 보여 저녁 산책이 더 안전해요' },
  { title: '인체공학 디자인', desc: '움직임을 막지 않으면서도 편안한 착용감' },
  { title: '방수 처리', desc: '가벼운 비에도 OK, 물티슈로 간단히 세척' },
];

const BODY_TYPES = [
  { type: '소형', range: '10kg 미만', fit: 'S' },
  { type: '중형', range: '10–25kg', fit: 'M' },
  { type: '대형', range: '25kg 이상', fit: 'L' },
];

export default function ProductDetailTemplateB() {
  return (
    <section className="border-t border-gray-100 bg-gray-50/50 py-20 md:py-24">
      <div className="mx-auto max-w-4xl px-4 md:px-6">
        <h2 className="text-xs font-medium uppercase tracking-widest text-gray-500">체형별 사이즈</h2>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-gray-600">
          반려견 몸무게에 맞는 사이즈를 선택하면 안정적이고 편안하게 착용할 수 있어요. 앞다리 뒤쪽 가슴 둘레를 재어 보시면 좋습니다.
        </p>
        <ul className="mt-8 grid gap-4 sm:grid-cols-3">
          {BODY_TYPES.map((row, i) => (
            <li
              key={i}
              className="rounded-lg border border-gray-100 bg-white p-5"
            >
              <p className="font-medium text-gray-900">{row.type}</p>
              <p className="mt-1 text-xs text-gray-500">{row.range}</p>
              <p className="mt-2 text-xs font-medium text-gray-700">추천 사이즈: {row.fit}</p>
            </li>
          ))}
        </ul>

        <h2 className="mt-16 text-xs font-medium uppercase tracking-widest text-gray-500">소재 및 특징</h2>
        <ul className="mt-8 grid gap-6 sm:grid-cols-3">
          {FEATURES.map((item, i) => (
            <li
              key={i}
              className="flex flex-col rounded-lg border border-gray-100 bg-white p-6"
            >
              <span className="text-2xl text-gray-300" aria-hidden>◆</span>
              <h3 className="mt-4 text-sm font-medium text-gray-800">{item.title}</h3>
              <p className="mt-2 text-xs text-gray-500">{item.desc}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
