/**
 * API 경로·base URI 단일 관리.
 * 모든 API path와 base URI는 여기서만 정의하고, 호출부에서는 이 값을 사용한다.
 * 규칙: .cursor/rules/api-communication.mdc
 */

const hasProcess = typeof process !== 'undefined';

/**
 * 백엔드 base URL (NEXT_PUBLIC_BACKEND_URL 우선, 없으면 NEXT_PUBLIC_API_URL, 없으면 '' = 동일 오리진)
 */
export function getBackendUri() {
  if (!hasProcess || !process.env) return '';
  return (
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    ''
  );
}

// ----- auth -----
export const auth = {
  adminLogin: '/api/auth/admin-login',
  partnerLogin: '/api/partner/auth/login',
  login: '/api/auth/login',
  signup: '/api/auth/signup',
};

// ----- admin -----
export const admin = {
  dashboard: '/api/admin/dashboard',
  upload: '/api/admin/upload',
  notices: '/api/admin/notices',
  notice: (id) => `/api/admin/notices/${id}`,
  faq: '/api/admin/faq',
  faqOne: (id) => `/api/admin/faq/${id}`,
  categories: '/api/admin/categories',
  products: '/api/admin/products',
  product: (id) => `/api/admin/products/${id}`,
  productOrder: '/api/admin/products/order',
  partners: '/api/admin/partners',
  partner: (id) => `/api/admin/partners/${id}`,
  orders: '/api/admin/orders',
  order: (id) => `/api/admin/orders/${id}`,
  oneToOneInquiries: '/api/admin/one-to-one-inquiries',
  oneToOneInquiry: (id) => `/api/admin/one-to-one-inquiries/${id}`,
  homeSections: '/api/admin/home-sections',
  homeSection: (id) => `/api/admin/home-sections/${id}`,
  categoryBest: '/api/admin/category-best',
  categoryBestOne: (id) => `/api/admin/category-best/${id}`,
  recommended: '/api/admin/recommended',
  recommendedOne: (id) => `/api/admin/recommended/${id}`,
  curation: '/api/admin/curation',
  curationOne: (id) => `/api/admin/curation/${id}`,
  banners: '/api/admin/banners',
  banner: (id) => `/api/admin/banners/${id}`,
};

// ----- partner -----
export const partner = {
  me: '/api/partner/me',
  register: '/api/partner/auth/register',
  upload: '/api/partner/upload',
  products: '/api/partner/products',
  product: (id) => `/api/partner/products/${id}`,
  productGenerateDetail: (id) => `/api/partner/products/${id}/generate-detail`,
  settlement: '/api/partner/settlement',
  inquiries: '/api/partner/inquiries',
  inquiry: (id) => `/api/partner/inquiries/${id}`,
  orders: '/api/partner/orders',
};

// ----- user (로그인 회원) -----
export const user = {
  me: '/api/user/me',
  orders: '/api/user/orders',
  order: (id) => `/api/user/orders/${id}`,
  wishlist: '/api/user/wishlist',
  reviews: '/api/user/reviews',
  review: (id) => `/api/user/reviews/${id}`,
  upload: '/api/user/upload',
  pets: '/api/user/pets',
  pet: (id) => `/api/user/pets/${id}`,
  inquiries: '/api/user/inquiries',
  canReview: '/api/user/can-review',
};

// ----- 공개(웹) -----
export const store = {
  categories: '/api/categories',
  brands: '/api/brands',
  products: '/api/products',
  product: (id) => `/api/products/${id}`,
  productReviews: (id) => `/api/products/${id}/reviews`,
  productInquiries: (id) => `/api/products/${id}/inquiries`,
  productCategoryBest: (id) => `/api/products/${id}/category-best`,
  productRecommended: (id) => `/api/products/${id}/recommended`,
  cart: '/api/cart',
  cartItem: (id) => `/api/cart/items/${id}`,
  orders: '/api/orders',
  order: (id) => `/api/orders/${id}`,
  orderPay: (id) => `/api/orders/${id}/pay`,
  orderCancel: (id) => `/api/orders/${id}/cancel`,
  homeSections: '/api/home-sections',
  banners: '/api/banners',
  curation: '/api/curation',
  notices: '/api/notices',
  faq: '/api/faq',
};

// ----- 고객센터·문의 -----
export const inquiry = {
  my: '/api/inquiry/my',
  upload: '/api/inquiry/upload',
  create: '/api/inquiry',
};
export const customerCenter = {
  settings: '/api/customer-center/settings',
};
