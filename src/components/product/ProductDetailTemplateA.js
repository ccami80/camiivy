'use client';

/**
 * Template A – Premium Lifestyle
 * Spacious layout, lifestyle-focused copy, editorial-style sections
 */
export default function ProductDetailTemplateA() {
  const sections = [
    {
      title: '일상에 맞춘 디자인',
      copy: '함께 움직이는 하네스. 가볍고 안전하며, 매일의 산책과 사계절을 함께할 수 있도록 만들었습니다.',
    },
    {
      title: '디테일의 품질',
      copy: '부드러운 마감, 조절 가능한 착용감, 미니멀한 실루엣. 과함 없이, 당신과 반려견에게 필요한 것만 담았습니다.',
    },
  ];

  return (
    <section className="py-24 md:py-28">
      <div className="mx-auto max-w-4xl px-4 md:px-6">
        <div className="aspect-[4/3] w-full overflow-hidden rounded-lg bg-gray-100" aria-hidden />
        <div className="mt-24 space-y-24">
          {sections.map((block, i) => (
            <div key={i} className="text-center">
              <h2 className="text-xs font-medium uppercase tracking-widest text-gray-400">
                {block.title}
              </h2>
              <p className="mt-6 max-w-xl mx-auto text-lg font-light leading-relaxed text-gray-600">
                {block.copy}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-24 text-center text-lg font-light text-gray-500">
          당신의 일상에 맞는 선택.
        </p>
      </div>
    </section>
  );
}
