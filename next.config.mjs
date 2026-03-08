/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactCompiler: true,
  async redirects() {
    return [
      // 이전 메인 경로: cami 스토어가 메인이 됨
      { source: '/cami', destination: '/', permanent: true },
      // 입점업체 경로 통일: seller → partner
      { source: '/signup/seller', destination: '/signup/partner', permanent: true },
      { source: '/seller', destination: '/partner', permanent: true },
      { source: '/seller/:path*', destination: '/partner/:path*', permanent: true },
      { source: '/admin/sellers', destination: '/admin/partners', permanent: true },
      // 사용자 영역 통일: mypage → my
      { source: '/mypage', destination: '/my', permanent: true },
      { source: '/mypage/:path*', destination: '/my/:path*', permanent: true },
    ];
  },
};

export default nextConfig;
