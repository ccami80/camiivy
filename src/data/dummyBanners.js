/**
 * 배너 더미 데이터
 * - 관리자 배너 페이지: 등록된 배너가 없을 때 미리보기로 표시
 * - 메인 페이지: /api/banners 가 비어 있을 때 노출
 */
export const DUMMY_BANNERS = [
  {
    id: 'dummy-banner-1',
    imageUrl: '/img/cami.jpg',
    linkUrl: '/products',
    title: 'OPEN',
    description: '봄 시즌 신상품 CAMI & IVY가 골라온 반려동물 용품',
    sortOrder: 0,
    isActive: true,
  },
  {
    id: 'dummy-banner-2',
    imageUrl: '/img/cami.jpg',
    linkUrl: '/products?category=walk',
    title: 'OPEN',
    description: '산책용품 특집 강아지와 함께하는 산책 필수 아이템',
    sortOrder: 1,
    isActive: true,
  },
  {
    id: 'dummy-banner-3',
    imageUrl: '/img/cami.jpg',
    linkUrl: '/my',
    title: '',
    description: '회원 전용 혜택 첫 구매 할인·무료배송',
    sortOrder: 2,
    isActive: true,
  },
];
