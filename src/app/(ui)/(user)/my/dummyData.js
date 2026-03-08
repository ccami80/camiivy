/**
 * 마이페이지 퍼블리싱용 더미 데이터 (API 연동 전 UI 확인용)
 * USE_DUMMY = true 이면 API 호출 없이 더미 데이터로 화면 표시.
 * 연동 시 USE_DUMMY = false 로 두고 각 페이지 API 호출 사용하면 됩니다.
 */
export const USE_DUMMY = false;

export const DUMMY_USER = {
  id: '1',
  email: 'user@example.com',
  name: '김까미',
  phone: '010-1234-5678',
};

export const DUMMY_ORDERS_COUNT = 3;
export const DUMMY_REVIEWS_COUNT = 2;
export const DUMMY_WISHLIST_COUNT = 5;

export const DUMMY_PETS = [
  { id: '1', name: '초코', petType: 'DOG', breed: '골든 리트리버', bodyType: '대형', birthDate: '2022-03-15' },
  { id: '2', name: '콩이', petType: 'DOG', breed: '웰시코기', bodyType: '소형', birthDate: '2023-07-01' },
];

export const DUMMY_ORDERS = [
  {
    id: '1',
    orderNumber: 'ORD-2025-001234',
    status: 'PAYMENT_COMPLETED',
    createdAt: '2025-02-10T10:30:00.000Z',
    totalAmount: 125000,
    items: [
      { id: '1', productName: '강아지 3단 미끄럼방지 계단', optionLabel: '소형', quantity: 1, imageUrl: '/img/cami.jpg' },
      { id: '2', productName: '프리미엄 강아지 사료 2kg', optionLabel: null, quantity: 2, imageUrl: '/img/cami.jpg' },
    ],
  },
  {
    id: '2',
    orderNumber: 'ORD-2025-001189',
    status: 'PAYMENT_COMPLETED',
    createdAt: '2025-02-05T14:20:00.000Z',
    totalAmount: 45800,
    items: [
      { id: '3', productName: '동물 친구들 강아지 실내복', optionLabel: '블루 / M', quantity: 1, imageUrl: '/img/cami.jpg' },
    ],
  },
  {
    id: '3',
    orderNumber: 'ORD-2025-001056',
    status: 'PAYMENT_PENDING',
    createdAt: '2025-02-01T09:00:00.000Z',
    totalAmount: 340000,
    items: [
      { id: '4', productName: '아망떼 보들보들 플란넬 극세사 펫 방석 베개세트', optionLabel: '그레이', quantity: 1, imageUrl: '/img/cami.jpg' },
    ],
  },
];

export const DUMMY_ORDER_DETAIL = {
  id: '1',
  orderNumber: 'ORD-2025-001234',
  status: 'PAYMENT_COMPLETED',
  createdAt: '2025-02-10T10:30:00.000Z',
  totalAmount: 125000,
  totalProductAmount: 113000,
  shippingFee: 3000,
  recipientName: '김까미',
  recipientPhone: '010-1234-5678',
  zipCode: '06134',
  address: '서울특별시 강남구 테헤란로 123',
  addressDetail: '까미빌딩 101호',
  items: [
    {
      id: '1',
      productId: 'p1',
      productName: '강아지 3단 미끄럼방지 계단 논슬립 애견 계단',
      optionLabel: '소형',
      quantity: 1,
      unitPrice: 45000,
      lineTotal: 45000,
      product: { images: [{ url: '/img/cami.jpg' }] },
    },
    {
      id: '2',
      productId: 'p2',
      productName: '프리미엄 강아지 사료 2kg',
      optionLabel: null,
      quantity: 2,
      unitPrice: 34000,
      lineTotal: 68000,
      product: { images: [{ url: null }] },
    },
  ],
};

export const DUMMY_REVIEWS = [
  {
    id: '1',
    productId: 'p1',
    product: { name: '강아지 3단 미끄럼방지 계단 논슬립 애견 계단' },
    rating: 5,
    content: '설치도 쉽고 안정적이에요. 우리 강아지가 잘 사용하고 있습니다. 추천해요!',
    petType: 'DOG',
    bodyType: '소형',
    imageUrls: [],
    createdAt: '2025-02-12T11:00:00.000Z',
  },
  {
    id: '2',
    productId: 'p2',
    product: { name: '동물 친구들 강아지 실내복 (블루)' },
    rating: 4,
    content: '사이즈가 딱 맞아요. 소형견에게 좋은 것 같아요. 다음에 다른 색상도 구매할게요.',
    petType: 'DOG',
    bodyType: '소형',
    imageUrls: [],
    createdAt: '2025-02-08T16:30:00.000Z',
  },
];

export const DUMMY_PRODUCT_FOR_REVIEW = {
  id: 'p1',
  name: '강아지 3단 미끄럼방지 계단 논슬립 애견 계단',
};

export const DUMMY_WISHLIST = [
  {
    id: 'w1',
    productId: 'p1',
    product: {
      id: 'p1',
      name: '몰리스 미끄러지지않는 패드 L(60x70cm)',
      basePrice: 14400,
      discountPercent: 20,
      images: [{ url: '/img/cami.jpg' }],
    },
  },
  {
    id: 'w2',
    productId: 'p2',
    product: {
      id: 'p2',
      name: '강아지 3단 미끄럼방지 계단 논슬립 애견 계단',
      basePrice: 43200,
      discountPercent: 4,
      images: [{ url: null }],
    },
  },
  {
    id: 'w3',
    productId: 'p3',
    product: {
      id: 'p3',
      name: '아망떼 보들보들 플란넬 극세사 펫 방석 베개세트',
      basePrice: 272000,
      discountPercent: 20,
      images: [{ url: null }],
    },
  },
  {
    id: 'w4',
    productId: 'p4',
    product: {
      id: 'p4',
      name: '프리미엄 강아지 사료 2kg',
      basePrice: 68000,
      images: [{ url: null }],
    },
  },
  {
    id: 'w5',
    productId: 'p5',
    product: {
      id: 'p5',
      name: '동물 친구들 강아지 실내복 (블루)',
      basePrice: 14800,
      images: [{ url: null }],
    },
  },
];

/** 고객님을 위한 상품 (추천) - 마이 페이지용 */
export const DUMMY_RECOMMENDED = [
  { id: 'r1', name: '휘게 강아지 고양이 바리깡 클리퍼 V3', basePrice: 56910, discountPercent: 4, imageUrl: '/img/cami.jpg' },
  { id: 'r2', name: '청담마켓 청도 반건시 곶감 선물세트 20입', basePrice: 34560, discountPercent: 2, imageUrl: '/img/cami.jpg' },
  { id: 'r3', name: '드리울 진드기완벽차단 방수 매트리스커버', basePrice: 12880, discountPercent: 18, imageUrl: '/img/cami.jpg' },
  { id: 'r4', name: '청담마켓 상주 반건시 곶감 선물세트 30입', basePrice: 45520, discountPercent: 2, imageUrl: '/img/cami.jpg' },
  { id: 'r5', name: '강아지 3단 미끄럼방지 계단 논슬립 애견 계단', basePrice: 43200, discountPercent: 4, imageUrl: '/img/cami.jpg' },
  { id: 'r6', name: '몰리스 미끄러지지않는 패드 L(60x70cm)', basePrice: 14400, discountPercent: 20, imageUrl: '/img/cami.jpg' },
  { id: 'r7', name: '프리미엄 강아지 사료 2kg', basePrice: 68000, discountPercent: 0, imageUrl: '/img/cami.jpg' },
  { id: 'r8', name: '아망떼 보들보들 플란넬 극세사 펫 방석 베개세트', basePrice: 272000, discountPercent: 20, imageUrl: '/img/cami.jpg' },
];
