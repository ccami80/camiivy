'use client';

export default function BrandStory({ brand }) {
  const isCami = brand === 'cami';
  const title = '까미 & 아이비가 선택하는 기준';
  const text = isCami
    ? '품질과 안전을 최우선으로, 강아지와 함께하는 일상에 맞춘 제품만을 골라 소개합니다.'
    : '고양이의 습성과 취향을 존중하며, 오래 쓸 수 있는 디자인과 소재를 고집합니다.';

  return (
    <section className={`py-20 ${isCami ? 'bg-[var(--cami)]/15' : 'bg-[var(--ivy)]/15'}`}>
      <div className="mx-auto max-w-2xl px-4 text-center md:px-6">
        <h2 className="text-2xl font-semibold text-gray-900">
          브랜드
        </h2>
        <p className="mt-6 text-lg font-medium text-gray-800">
          {title}
        </p>
        <p className="mt-4 text-sm leading-relaxed text-gray-600">
          {text}
        </p>
      </div>
    </section>
  );
}
