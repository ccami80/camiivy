# CAMI & IVY — API 및 화면 스펙

> 페이지별 필요 API 목록과 주요 화면 구성·동작 요약. 구현 시 CRUD·권한 체크 필수.

---

## 1. API Routes 요약

### 1-1. 인증 (api/auth)

| 메서드 | 경로 | 역할 | 권한 |
|--------|------|------|------|
| POST | /api/auth/login | 이메일/비밀번호 로그인 (User 또는 Partner 조회) | Public |
| POST | /api/auth/signup | 일반회원 가입 | Public |
| POST | /api/auth/partner-signup | 입점업체 가입 | Public |
| POST | /api/auth/admin-login | 관리자 로그인 | Public |
| POST | /api/auth/logout | 로그아웃 (클라이언트에서 토큰 제거, 선택적 블랙리스트) | User/Partner |
| GET  | /api/auth/me | 현재 로그인 사용자/입점업체 정보 (JWT 검증) | User/Partner |

---

### 1-2. 상품 (api/products)

| 메서드 | 경로 | 역할 | 권한 |
|--------|------|------|------|
| GET    | /api/products | 목록 조회 (필터: brand, petType, categoryId, minPrice, maxPrice / 정렬: recommend, popular, latest) | Public |
| GET    | /api/products/[id] | 상품 상세 (이미지, 옵션, variant, 리뷰 요약) | Public |
| POST   | /api/products | 상품 생성 | Partner(승인됨) |
| PATCH  | /api/products/[id] | 상품 수정 | Partner(본인 상품) |
| DELETE | /api/products/[id] | 상품 삭제 (소프트 삭제 또는 상태 변경 권장) | Partner(본인 상품) |

---

### 1-3. 카테고리 (api/categories)

| 메서드 | 경로 | 역할 | 권한 |
|--------|------|------|------|
| GET | /api/categories | 카테고리 목록 (petType, brand 쿼리 가능) | Public |

---

### 1-4. AI 상세 콘텐츠 (api/ai-detail)

| 메서드 | 경로 | 역할 | 권한 |
|--------|------|------|------|
| POST | /api/ai-detail | 상품 입력 데이터 + 템플릿 타입(LIFESTYLE/FUNCTIONAL/EMOTIONAL) 받아 상세 HTML 생성 후 반환 | Partner(승인됨) 또는 Admin |

- **Request body**: productName, brand, petType, category, price, options, keyFeatures, tone, templateType 등
- **Response**: generatedDetailContent (HTML 문자열)

---

### 1-5. 장바구니 (api/cart)

| 메서드 | 경로 | 역할 | 권한 |
|--------|------|------|------|
| GET    | /api/cart | 내 장바구니 조회 (userId 또는 sessionId) | Public(세션) / User |
| POST   | /api/cart | 장바구니에 담기 (productId, variantId?, quantity) | Public(세션) / User |
| PATCH  | /api/cart | 수량/옵션 변경 | Public(세션) / User |
| DELETE | /api/cart | 항목 삭제 또는 비우기 | Public(세션) / User |

---

### 1-6. 주문 (api/orders)

| 메서드 | 경로 | 역할 | 권한 |
|--------|------|------|------|
| POST   | /api/orders | 주문 생성 (장바구니 기반 또는 직접 상품/수량) | User |
| GET    | /api/orders | 내 주문 목록 (상태 필터) | User |
| GET    | /api/orders/[id] | 주문 상세 | User(본인) |
| GET    | /api/orders/inquiry | 비회원 주문 조회 (orderNumber + phone) | Public |
| PATCH  | /api/orders/[id]/cancel | 주문 취소 요청 | User(본인) |

---

### 1-7. 회원 마이페이지 (api/users, api/my)

| 메서드 | 경로 | 역할 | 권한 |
|--------|------|------|------|
| GET    | /api/my/profile | 내 프로필 | User |
| PATCH  | /api/my/profile | 프로필 수정 | User |
| GET    | /api/my/pets | 반려동물 목록 | User |
| POST   | /api/my/pets | 반려동물 등록 | User |
| PATCH  | /api/my/pets/[id] | 반려동물 수정 | User |
| DELETE | /api/my/pets/[id] | 반려동물 삭제 | User |
| GET    | /api/my/addresses | 배송지 목록 | User |
| POST   | /api/my/addresses | 배송지 추가 | User |
| PATCH  | /api/my/addresses/[id] | 배송지 수정 | User |
| DELETE | /api/my/addresses/[id] | 배송지 삭제 | User |
| GET    | /api/my/wishlist | 찜 목록 | User |
| POST   | /api/my/wishlist | 찜 추가 (productId) | User |
| DELETE | /api/my/wishlist/[productId] | 찜 삭제 | User |
| GET    | /api/my/coupons | 보유 쿠폰 / 사용 내역 | User |
| GET    | /api/my/points | 포인트 잔액·내역 | User |
| GET    | /api/my/reviews | 내가 쓴 리뷰 목록 | User |
| POST   | /api/reviews | 리뷰 작성 (orderItemId, productId, rating, content, bodyType?, images?) | User |
| PATCH  | /api/reviews/[id] | 리뷰 수정 | User(본인) |
| DELETE | /api/reviews/[id] | 리뷰 삭제 | User(본인) |

---

### 1-8. 입점업체 (api/partner)

| 메서드 | 경로 | 역할 | 권한 |
|--------|------|------|------|
| GET  | /api/partner | 내 입점업체 정보·대시 요약 | Partner(승인됨) |
| GET  | /api/partner/products | 내 상품 목록 (승인 상태 필터) | Partner(승인됨) |
| GET  | /api/partner/orders | 내 주문 목록 (OrderItem 기준 partnerId) | Partner(승인됨) |
| GET  | /api/partner/settlements | 정산 목록 | Partner(승인됨) |
| GET  | /api/partner/settlements/[id] | 정산 상세 | Partner(승인됨) |

- 상품 CRUD는 `/api/products`에서 partnerId로 본인 여부 체크.

---

### 1-9. 관리자 (api/admin)

| 메서드 | 경로 | 역할 | 권한 |
|--------|------|------|------|
| GET    | /api/admin/dashboard | 대시보드 통계·요약 | Admin |
| GET    | /api/admin/users | 회원 목록·검색 | Admin |
| GET    | /api/admin/users/[id] | 회원 상세 | Admin |
| PATCH  | /api/admin/users/[id] | 회원 정지/해제 등 | Admin |
| GET    | /api/admin/partners | 입점업체 목록 (상태 필터) | Admin |
| PATCH  | /api/admin/partners/[id]/approve | 입점업체 승인 | Admin |
| PATCH  | /api/admin/partners/[id]/reject | 입점업체 반려 | Admin |
| GET    | /api/admin/products | 상품 목록 (승인 상태 필터) | Admin |
| GET    | /api/admin/products/[id] | 상품 상세 | Admin |
| PATCH  | /api/admin/products/[id]/approve | 상품 승인 | Admin |
| PATCH  | /api/admin/products/[id]/reject | 상품 반려 | Admin |
| GET    | /api/admin/orders | 주문 목록·검색 | Admin |
| PATCH  | /api/admin/orders/[id] | 주문 상태 변경·환불 처리 | Admin |
| GET    | /api/admin/curation | 큐레이션 목록 | Admin |
| POST   | /api/admin/curation | 큐레이션 생성 | Admin |
| PATCH  | /api/admin/curation/[id] | 큐레이션 수정 (순서, 노출 상품, 활성화) | Admin |
| DELETE | /api/admin/curation/[id] | 큐레이션 삭제 | Admin |

---

## 2. 페이지별 화면 스펙 요약

### 2-1. Public

- **메인 (/)**  
  - 상단: 브랜드 선택(까미/아이비), 히어로 배너(큐레이션 HERO_BANNER).  
  - 스토리 요약, 추천 카테고리(큐레이션 CATEGORY 또는 카테고리 API), 베스트 상품(큐레이션 BEST_PRODUCT), 리뷰 하이라이트(큐레이션 REVIEW_HIGHLIGHT).  
  - 모든 데이터는 API 연동(큐레이션 API, 상품 API).

- **상품 리스트 (/products)**  
  - 필터: 브랜드, 반려동물 타입, 카테고리, 가격대, 체형(있을 경우).  
  - 정렬: 추천순, 인기순, 최신순.  
  - 목록: 카드 그리드, 썸네일·이름·가격·리뷰 수 등.  
  - GET /api/products 사용.

- **상품 상세 (/products/[id])**  
  - 상단: 이미지 갤러리, 상품명, 가격, 옵션(사이즈/색상) 선택, 재고 표시, 배송 정보.  
  - 하단: AI 생성 상세 콘텐츠(템플릿 3종 중 하나로 렌더), 리뷰 목록(체형 표시), AI 리뷰 요약(있을 경우).  
  - 장바구니 담기·찜·구매하기 버튼.  
  - GET /api/products/[id] 사용.

- **장바구니 (/cart)**  
  - 행: 상품 이미지·이름·옵션·단가·수량 변경·삭제·소계.  
  - 총 금액, 주문하기 버튼(클릭 시 로그인 여부 확인 후 /checkout 이동).  
  - GET/PATCH/DELETE /api/cart 사용.

---

### 2-2. Auth

- **로그인 (/login)**  
  - 이메일, 비밀번호, (선택) 소셜 로그인.  
  - 성공 시: User → /my, Partner(승인) → /partner, Partner(대기) → /partner/pending, Admin은 /admin/login 사용.

- **회원가입 (/signup)**  
  - 이메일, 비밀번호, 이름, 전화번호, 약관 동의.  
  - POST /api/auth/signup 후 로그인 페이지 또는 자동 로그인.

- **비회원 주문 조회 (/order-inquiry)**  
  - 주문번호, 연락처 입력 → GET /api/orders/inquiry로 조회 결과 표시.

---

### 2-3. User — 마이페이지

- **마이 홈 (/my)**  
  - 최근 주문 요약, 찜/쿠폰/포인트 요약, 각 메뉴 링크.  
  - 필요한 API: 주문 목록 일부, 찜 개수, 쿠폰/포인트 요약.

- **회원 정보 (/my/profile)**  
  - 이름, 전화번호 등 수정 폼, 비밀번호 변경.  
  - GET/PATCH /api/my/profile.

- **반려동물 프로필 (/my/pets)**  
  - 반려동물 목록, 추가/수정/삭제 폼.  
  - CRUD /api/my/pets.

- **주문 내역 (/my/orders, /my/orders/[id])**  
  - 목록: 주문번호, 날짜, 금액, 상태, 상세 링크.  
  - 상세: 주문 정보, 배송지, 상품 목록, 취소/환불 신청.  
  - GET /api/orders, GET /api/orders/[id], PATCH 취소.

- **리뷰 관리 (/my/reviews)**  
  - 작성한 리뷰 목록, 수정/삭제.  
  - GET /api/my/reviews, PATCH/DELETE /api/reviews/[id].

- **찜 목록 (/my/wishlist)**  
  - 찜한 상품 카드, 삭제·장바구니 담기.  
  - GET/POST/DELETE /api/my/wishlist.

- **쿠폰/포인트 (/my/coupons)**  
  - 보유 쿠폰, 사용 내역 / 포인트 잔액·적립·사용 내역.  
  - GET /api/my/coupons, GET /api/my/points.

- **주문서·결제 (/checkout)**  
  - 배송지 선택/입력, 쿠폰 선택, 결제 수단, 주문 금액 요약.  
  - POST /api/orders로 주문 생성 후 결제 연동(또는 더미 결제).

---

### 2-4. Partner — 입점업체

- **입점업체 회원가입 (/partner/signup)**  
  - 이메일, 비밀번호, 사업자명, 사업자번호, 담당자명, 연락처 등.  
  - POST /api/auth/partner-signup.

- **승인 대기 (/partner/pending)**  
  - “승인 대기 중” 안내 문구, 재로그인 시에도 status가 PENDING이면 이 페이지만 허용.

- **대시보드 (/partner)**  
  - 주문 건수·매출 요약, 상품 수·승인 대기 수.  
  - GET /api/partner.

- **상품 목록 (/partner/products)**  
  - 테이블/카드: 상품명, 브랜드, 카테고리, 가격, 재고, 승인 상태, 수정/삭제.  
  - GET /api/partner/products.

- **상품 등록 (/partner/products/new)**  
  - 상품명, 브랜드, 반려동물 타입, 카테고리, 가격, 재고, 옵션(사이즈/색상), 배송 정보, 상세 입력 폼.  
  - **템플릿 3종 선택 후 “AI 상세 생성” 버튼** → POST /api/ai-detail 호출 → 생성된 HTML을 detailContent에 반영 후 상품 저장.  
  - POST /api/products.

- **상품 수정 (/partner/products/[id]/edit)**  
  - 기존 값 로드 후 동일 폼, AI 상세 재생성 가능.  
  - GET /api/products/[id], PATCH /api/products/[id].

- **주문 관리 (/partner/orders)**  
  - 내 상품 주문 목록, 상태 변경(배송 준비/발송 등).  
  - GET /api/partner/orders, 필요 시 PATCH 주문/주문항목 상태 API.

- **정산 관리 (/partner/settlement)**  
  - 기간별 정산 목록·금액·상태.  
  - GET /api/partner/settlements, GET /api/partner/settlements/[id].

---

### 2-5. Admin — 관리자

- **관리자 로그인 (/admin/login)**  
  - 관리자 전용 이메일/비밀번호.  
  - POST /api/auth/admin-login.

- **대시보드 (/admin)**  
  - 회원 수, 입점업체 수, 상품 수, 주문/매출 요약, 승인 대기 건수.  
  - GET /api/admin/dashboard.

- **회원 관리 (/admin/users)**  
  - 목록·검색·상세·정지 등.  
  - GET /api/admin/users, GET/PATCH /api/admin/users/[id].

- **입점업체 관리 (/admin/partners)**  
  - 목록, 승인/반려 버튼.  
  - GET /api/admin/partners, PATCH approve/reject.

- **상품 관리 (/admin/products, /admin/products/[id])**  
  - 목록·검색·승인 상태 필터, 상세에서 승인/반려.  
  - GET /api/admin/products, GET /api/admin/products/[id], PATCH approve/reject.

- **주문/환불/정산 (/admin/orders)**  
  - 주문 목록·상세·상태 변경·환불 처리.  
  - GET /api/admin/orders, PATCH /api/admin/orders/[id].

- **메인 큐레이션 (/admin/curation)**  
  - 블록 목록(히어로, 카테고리, 베스트, 리뷰 등), 순서 변경, 노출 상품/이미지/링크 설정, 활성/비활성.  
  - CRUD /api/admin/curation.

---

## 3. 공통 규칙

- **권한**: 모든 API·페이지에서 역할(비회원/User/Partner/Admin) 체크 후 접근 제어.  
- **폼**: mock·placeholder 금지, 실제 Prisma 연동 CRUD.  
- **AI 상세**: 상품 등록/수정 시 템플릿 선택 + AI 생성 API 호출 후 상세 콘텐츠 저장 필수.  
- **JWT**: 로그인 응답에 JWT 포함, 이후 요청 Header (Authorization)로 전달.

이 문서와 `01-프로젝트-폴더-및-페이지-구조.md`, `02-DB-스키마-Prisma.md`를 함께 사용하면 페이지·API·DB를 일치시켜 구현할 수 있다.
