'use client';

import Link from 'next/link';

export default function HeroSection({ brand }) {
  const isCami = brand === 'cami';

  return (
    <section
      className="relative flex min-h-[50vh] items-center justify-center overflow-hidden bg-[var(--cami)]/30 md:min-h-[60vh]"
      aria-label="메인 배너"
    >
      {/* 배경 이미지 */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/img/cami.jpg')",
        }}
      />
      <div
        className="absolute inset-0 bg-[var(--cami-deep)]/20"
        aria-hidden
      />
      {/* 콘텐츠 */}
      <div className="relative z-10 mx-auto max-w-4xl px-4 text-center">
        <p className="text-sm font-medium tracking-[0.2em] text-white/95 md:text-base">
          {isCami ? 'CAMİ' : 'IVY'}
        </p>
        <h1 className="mt-3 text-3xl font-light tracking-wide text-white drop-shadow-sm md:text-4xl lg:text-5xl">
          일상의 품격을 입히다
        </h1>
        <p className="mt-4 text-sm text-white/90 md:text-base">
          반려동물을 위한 진짜 선택
        </p>
        <Link
          href="/products"
          className="mt-8 inline-block rounded-full border border-white/80 bg-white/10 px-8 py-3 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-white/20"
        >
          스토어 보기
        </Link>
      </div>
    </section>
  );
}
