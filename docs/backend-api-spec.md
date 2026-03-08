# 백엔드 API 명세

- **Base URL**: `getBackendUri()` (환경변수 `NEXT_PUBLIC_BACKEND_URL` 또는 `NEXT_PUBLIC_API_URL`, 없으면 동일 오리진)
- **클라이언트**: `src/utils/apis.js`의 `api.get/post/patch/delete`만 사용
- **경로 상수**: `src/utils/apiPaths.js` 참고

---

## 1. 인증 (Auth)

### 1.1 일반 회원 로그인

| 항목 | 내용 |
|------|------|
| **Method** | POST |
| **URL** | `/api/auth/login` |
| **인증** | 없음 |

**요청 (Body)**

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| email | string | O | 이메일 |
| password | string | O | 비밀번호 |

**응답 (200)**

```json
{
  "token": "string",
  "user": {
    "id": "string",
    "email": "string",
    "name": "string",
    "phone": "string | null"
  }
}
```

**에러**  
- 400: `{ "error": "이메일과 비밀번호를 입력해 주세요." }`  
- 401: `{ "error": "이메일 또는 비밀번호가 올바르지 않습니다." }`  
- 500: `{ "error": "로그인 처리 중 오류가 발생했습니다." }`

---

### 1.2 일반 회원 회원가입

| 항목 | 내용 |
|------|------|
| **Method** | POST |
| **URL** | `/api/auth/signup` |
| **인증** | 없음 |

**요청 (Body)**

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| email | string | O | 이메일 |
| password | string | O | 6자 이상 |
| name | string | O | 이름 |
| phone | string | - | 연락처 |

**응답 (200)**

```json
{
  "token": "string",
  "user": {
    "id": "string",
    "email": "string",
    "name": "string",
    "phone": "string | null"
  }
}
```

**에러**  
- 400: 이메일/비밀번호/이름 필수, 비밀번호 6자 이상, 이미 사용 중인 이메일  
- 500: 회원가입 처리 중 오류

---

### 1.3 관리자 로그인

| 항목 | 내용 |
|------|------|
| **Method** | POST |
| **URL** | `/api/auth/admin-login` |
| **인증** | 없음 |

**요청 (Body)**

| 필드 | 타입 | 필수 |
|------|------|------|
| email | string | O |
| password | string | O |

**응답 (200)**

```json
{
  "token": "string",
  "admin": {
    "id": "string",
    "email": "string",
    "name": "string"
  }
}
```

**에러**  
- 400: 이메일/비밀번호 필수  
- 401: 이메일 또는 비밀번호 불일치  
- 500: 로그인 처리 중 오류

---

### 1.4 파트너(입점업체) 로그인

| 항목 | 내용 |
|------|------|
| **Method** | POST |
| **URL** | `/api/partner/auth/login` |
| **인증** | 없음 |

**요청 (Body)**

| 필드 | 타입 | 필수 |
|------|------|------|
| email | string | O |
| password | string | O |

**응답 (200)**

```json
{
  "token": "string",
  "partner": {
    "id": "string",
    "email": "string",
    "companyName": "string",
    "status": "APPROVED"
  }
}
```

**에러**  
- 400: 이메일/비밀번호 필수  
- 401: 이메일 또는 비밀번호 불일치  
- 403: 승인된 입점업체만 로그인 가능  
- 500: 로그인 처리 중 오류

---

### 1.5 파트너 회원가입

| 항목 | 내용 |
|------|------|
| **Method** | POST |
| **URL** | `/api/partner/auth/register` |
| **인증** | 없음 |

**요청 (Body)**

| 필드 | 타입 | 필수 |
|------|------|------|
| email | string | O |
| password | string | O (6자 이상) |
| companyName | string | O |
| businessNumber | string | O |
| contactName | string | O |
| contactPhone | string | O |

**응답 (200)**

```json
{
  "message": "가입이 완료되었습니다. 관리자 승인 후 입점이 가능합니다.",
  "partner": {
    "id": "string",
    "email": "string",
    "companyName": "string",
    "status": "PENDING"
  }
}
```

**에러**  
- 400: 필수값 누락, 비밀번호 6자 이상, 이미 사용 중인 이메일  
- 500: 회원가입 처리 중 오류

---

## 2. 공개(스토어) API

### 2.1 상품 목록

| 항목 | 내용 |
|------|------|
| **Method** | GET |
| **URL** | `/api/products` |
| **인증** | 없음 |

**요청 (Query)**

| 파라미터 | 타입 | 설명 |
|----------|------|------|
| brand | string | 브랜드 |
| petType | string | DOG 등 (CAT 제외) |
| categoryId | string | 카테고리 ID |
| sort | string | latest, popular, price_asc, price_desc, sales |
| q | string | 검색어 (상품명/설명) |
| minPrice | number | 최소 가격 |
| maxPrice | number | 최대 가격 |

**응답 (200)**  
승인(APPROVED) 상품 배열. 각 항목에 category, images 등 포함.

**에러**  
- 500: 상품 목록 조회 오류

---

### 2.2 상품 상세

| 항목 | 내용 |
|------|------|
| **Method** | GET |
| **URL** | `/api/products/:id` |
| **인증** | 없음 (파트너 본인 상품이면 승인 전에도 조회 가능) |

**요청**  
- Path: `id` — 상품 ID

**응답 (200)**  
상품 상세 객체 (category, partner, images, variants 포함)

**에러**  
- 400: 상품 ID 필요  
- 404: 상품 없음  
- 500: 상품 조회 오류

---

### 2.3 상품 리뷰 목록

| 항목 | 내용 |
|------|------|
| **Method** | GET |
| **URL** | `/api/products/:id/reviews` |
| **인증** | 없음 |

**요청 (Query)**

| 파라미터 | 타입 | 설명 |
|----------|------|------|
| sort | string | recent, rating_high, rating_low |
| bodyType | string | 필터 |
| petType | string | DOG, CAT |

**응답 (200)**

```json
{
  "reviews": [
    {
      "id": "string",
      "rating": 1-5,
      "content": "string",
      "bodyType": "string | null",
      "petType": "string | null",
      "imageUrls": ["string"],
      "createdAt": "ISO8601",
      "writerName": "string"
    }
  ],
  "summary": {
    "average": "number | null",
    "count": "number",
    "distribution": { "5": 0, "4": 0, "3": 0, "2": 0, "1": 0 }
  }
}
```

---

### 2.4 상품 문의 목록

| 항목 | 내용 |
|------|------|
| **Method** | GET |
| **URL** | `/api/products/:id/inquiries` |
| **인증** | 없음 |

**응답 (200)**  
`{ "inquiries": [ { id, title, content, secret, answer, answeredAt, createdAt, writerName, maskedContent } ] }`  
비밀글은 본인만 content 노출.

---

### 2.5 상품 문의 등록

| 항목 | 내용 |
|------|------|
| **Method** | POST |
| **URL** | `/api/products/:id/inquiries` |
| **인증** | 없음 (로그인 시 userId 저장) |

**요청 (Body)**

| 필드 | 타입 | 필수 |
|------|------|------|
| title | string | O (200자 이내) |
| content | string | O |
| secret | boolean | - |
| emailReply | boolean | - |

**응답 (200)**  
`{ "id": "string", "message": "문의가 등록되었습니다." }`

**에러**  
- 400: 제목/내용 필수  
- 404: 상품 없음  
- 500: 문의 등록 실패

---

### 2.6 상품 카테고리 베스트

| 항목 | 내용 |
|------|------|
| **Method** | GET |
| **URL** | `/api/products/:id/category-best` |
| **인증** | 없음 |

**응답 (200)**  
해당 상품 카테고리의 베스트 상품 배열 (최대 12개).

---

### 2.7 함께 구매 추천 상품

| 항목 | 내용 |
|------|------|
| **Method** | GET |
| **URL** | `/api/products/:id/recommended` |
| **인증** | 없음 |

**응답 (200)**  
추천 상품 배열 (최대 10개).

---

### 2.8 카테고리 목록

| 항목 | 내용 |
|------|------|
| **Method** | GET |
| **URL** | `/api/categories` |
| **인증** | 없음 |

**요청 (Query)**  
`petType` (선택, CAT이면 빈 배열)

**응답 (200)**  
카테고리 배열.

---

### 2.9 브랜드 목록

| 항목 | 내용 |
|------|------|
| **Method** | GET |
| **URL** | `/api/brands` |
| **인증** | 없음 |

**응답 (200)**  
승인 상품에서 사용 중인 브랜드 문자열 배열.

---

### 2.10 메인 섹션 (신상품 베스트 / 베스트)

| 항목 | 내용 |
|------|------|
| **Method** | GET |
| **URL** | `/api/home-sections` |
| **인증** | 없음 |

**응답 (200)**

```json
{
  "newBest": [ "Product[]" ],
  "best": [ "Product[]" ]
}
```

---

### 2.11 배너 목록

| 항목 | 내용 |
|------|------|
| **Method** | GET |
| **URL** | `/api/banners` |
| **인증** | 없음 |

**응답 (200)**  
`isActive: true` 배너 배열.

---

### 2.12 큐레이션 목록

| 항목 | 내용 |
|------|------|
| **Method** | GET |
| **URL** | `/api/curation` |
| **인증** | 없음 |

**응답 (200)**  
승인 상품만 정렬된 상품 배열.

---

### 2.13 공지사항 목록

| 항목 | 내용 |
|------|------|
| **Method** | GET |
| **URL** | `/api/notices` |
| **인증** | 없음 |

**응답 (200)**  
`{ id, type, title, createdAt, date }` 배열.

---

### 2.14 FAQ 목록

| 항목 | 내용 |
|------|------|
| **Method** | GET |
| **URL** | `/api/faq` |
| **인증** | 없음 |

**요청 (Query)**  
`category` (선택, all이면 전체)

**응답 (200)**  
FAQ 배열.

---

### 2.15 고객센터 설정

| 항목 | 내용 |
|------|------|
| **Method** | GET |
| **URL** | `/api/customer-center/settings` |
| **인증** | 없음 |

**응답 (200)**  
1:1 문의 관련 설정 객체.

---

## 3. 장바구니

### 3.1 장바구니 조회

| 항목 | 내용 |
|------|------|
| **Method** | GET |
| **URL** | `/api/cart` |
| **인증** | 쿠키 `cart_session_id` |

**응답 (200)**  
`{ "cart": { "id", "sessionId" } | null, "items": [ { id, productId, quantity, optionLabel, product, lineTotal } ] }`  
세션 없으면 `{ cart: null, items: [] }`.

---

### 3.2 장바구니에 상품 추가

| 항목 | 내용 |
|------|------|
| **Method** | POST |
| **URL** | `/api/cart` |
| **인증** | 쿠키 (없으면 새 세션 생성 후 Set-Cookie) |

**요청 (Body)**

| 필드 | 타입 | 필수 |
|------|------|------|
| productId | string | O |
| quantity | number | - (기본 1) |
| optionLabel | string | - |

**응답 (200)**  
`{ "success": true }`  
새 장바구니 생성 시 응답 헤더에 `Set-Cookie` (cart_session_id).

**에러**  
- 400: 상품 ID 필요, 구매 불가 상품, 재고 부족  
- 404: 상품 없음  
- 500: 장바구니 추가 오류

---

### 3.3 장바구니 항목 수량 변경/삭제

| 항목 | 내용 |
|------|------|
| **Method** | PATCH |
| **URL** | `/api/cart/items/:itemId` |
| **인증** | 쿠키 |

**요청 (Body)**  
`{ "quantity": number }` — 1 미만이면 항목 삭제(removed: true)

**응답 (200)**  
`{ "success": true, "removed": true }` (수량 0 이하일 때만 removed)

**에러**  
- 400: 재고 초과  
- 401: 장바구니 세션 없음  
- 404: 항목 없음  
- 500: 수정 오류

---

### 3.4 장바구니 항목 삭제

| 항목 | 내용 |
|------|------|
| **Method** | DELETE |
| **URL** | `/api/cart/items/:itemId` |
| **인증** | 쿠키 |

**응답 (200)**  
`{ "success": true }`

**에러**  
- 401: 장바구니 세션 없음  
- 404: 항목 없음  
- 500: 삭제 오류

---

## 4. 주문

### 4.1 주문 생성

| 항목 | 내용 |
|------|------|
| **Method** | POST |
| **URL** | `/api/orders` |
| **인증** | 쿠키(장바구니), 선택: 회원 토큰 |

**요청 (Body)**

| 필드 | 타입 | 필수 |
|------|------|------|
| recipientName | string | O |
| recipientPhone | string | O |
| recipientEmail | string | O |
| zipCode | string | O |
| address | string | O |
| addressDetail | string | - |
| memo | string | - |
| shippingFee | number | - (기본 0) |

**응답 (200)**  
생성된 주문 객체 (items, product 이미지 등 포함).

**에러**  
- 400: 장바구니 비어 있음/세션 만료, 수령인/연락처/이메일/우편번호/주소 필수, 구매 불가/재고 부족  
- 500: 주문 생성 오류

---

### 4.2 주문 단건 조회

| 항목 | 내용 |
|------|------|
| **Method** | GET |
| **URL** | `/api/orders/:id` |
| **인증** | 없음 |

**응답 (200)**  
주문 상세 (items, product 포함).

**에러**  
- 400: 주문 ID 필요  
- 404: 주문 없음  
- 500: 조회 오류

---

### 4.3 결제 완료 처리 (시뮬레이션)

| 항목 | 내용 |
|------|------|
| **Method** | POST |
| **URL** | `/api/orders/:id/pay` |
| **인증** | 없음 |

**응답 (200)**  
업데이트된 주문 (재고 차감, status: PAYMENT_COMPLETED, paidAt 설정).

**에러**  
- 400: 주문 ID 필요, 이미 처리됨, 재고 부족  
- 404: 주문 없음  
- 500: 결제 처리 오류

---

### 4.4 주문 취소

| 항목 | 내용 |
|------|------|
| **Method** | POST |
| **URL** | `/api/orders/:id/cancel` |
| **인증** | 없음 |

**조건**  
결제 대기(PAYMENT_PENDING)만 취소 가능.

**응답 (200)**  
업데이트된 주문 (status: CANCELLED).

**에러**  
- 400: 주문 ID 필요, 결제 대기만 취소 가능  
- 404: 주문 없음  
- 500: 취소 오류

---

### 4.5 비회원 주문 조회 (주문번호 + 연락처)

| 항목 | 내용 |
|------|------|
| **Method** | GET |
| **URL** | `/api/orders/lookup` |
| **인증** | 없음 |

**요청 (Query)**

| 파라미터 | 타입 | 필수 |
|----------|------|------|
| orderNumber | string | O |
| phone | string | O (숫자 10자리 이상) |

**응답 (200)**  
`{ "id", "orderNumber", "createdAt", "status", "itemSummary" }`  
(수령인 연락처는 제외)

**에러**  
- 400: 주문번호/휴대폰 필수, 휴대폰 형식  
- 404: 일치하는 주문 없음  
- 500: 조회 오류

---

## 5. 1:1 문의

### 5.1 1:1 문의 등록

| 항목 | 내용 |
|------|------|
| **Method** | POST |
| **URL** | `/api/inquiry` |
| **인증** | 선택 (회원 시 userId 연동) |

**요청 (Body)**

| 필드 | 타입 | 필수 |
|------|------|------|
| inquiryType | string | O (취소/환불, 배송, 교환/반품, 상품, 회원/로그인, 기타) |
| orderId | string | O (문의유형이 주문 관련일 때) |
| orderNumber | string | - |
| orderPhone | string | - |
| content | string | O (4000자 이내) |
| imageUrls | string[] | - (최대 3개) |
| notifySms | boolean | - |
| notifyEmail | boolean | - |
| phone | string | - |
| email | string | - |

**응답 (200)**  
`{ "ok": true }`

**에러**  
- 400: 문의유형/주문 선택/내용 필수, 내용 길이 초과  
- 500: 문의 등록 오류

---

### 5.2 내 1:1 문의 목록

| 항목 | 내용 |
|------|------|
| **Method** | GET |
| **URL** | `/api/inquiry/my` |
| **인증** | 회원 Bearer |

**응답 (200)**  
`[ { id, inquiryType, content, status, answer, answeredAt, createdAt } ]`

**에러**  
- 401: 로그인 필요  
- 500: 조회 오류

---

### 5.3 1:1 문의 이미지 업로드

| 항목 | 내용 |
|------|------|
| **Method** | POST |
| **URL** | `/api/inquiry/upload` |
| **인증** | 없음 |
| **Content-Type** | multipart/form-data |

**요청**  
`files`: 이미지 파일 (jpg, png, 최대 3개, 5MB 이하)

**응답 (200)**  
`{ "urls": [ "/uploads/...", ... ] }`

**에러**  
- 400: 파일 없음, 개수/형식/크기 제한  
- 500: 업로드 오류

---

## 6. 회원(User) API — Bearer 인증

### 6.1 내 정보 조회

| 항목 | 내용 |
|------|------|
| **Method** | GET |
| **URL** | `/api/user/me` |
| **인증** | Bearer (회원) |

**응답 (200)**  
`{ "id", "email", "name", "phone", "createdAt" }`

**에러**  
- 401: 로그인 필요  
- 404: 회원 없음  
- 500: 조회 오류

---

### 6.2 내 정보 수정

| 항목 | 내용 |
|------|------|
| **Method** | PATCH |
| **URL** | `/api/user/me` |
| **인증** | Bearer (회원) |

**요청 (Body)**  
`{ "name": string, "phone": string | null }` (일부만 보내도 됨)

**응답 (200)**  
`{ "id", "email", "name", "phone" }`

**에러**  
- 400: 수정할 항목 없음  
- 401: 로그인 필요  
- 500: 수정 오류

---

### 6.3 내 주문 목록

| 항목 | 내용 |
|------|------|
| **Method** | GET |
| **URL** | `/api/user/orders` |
| **인증** | Bearer (회원) |

**응답 (200)**  
주문 배열 (items, product 이미지 포함).

**에러**  
- 401: 로그인 필요  
- 500: 조회 오류

---

### 6.4 내 주문 상세

| 항목 | 내용 |
|------|------|
| **Method** | GET |
| **URL** | `/api/user/orders/:id` |
| **인증** | Bearer (회원) |

**응답 (200)**  
본인 주문만 조회 가능.

**에러**  
- 400: 주문 ID 필요  
- 401: 로그인 필요  
- 404: 주문 없음  
- 500: 조회 오류

---

### 6.5 찜 목록

| 항목 | 내용 |
|------|------|
| **Method** | GET |
| **URL** | `/api/user/wishlist` |
| **인증** | Bearer (회원) |

**응답 (200)**  
찜 항목 배열 (product 포함).

---

### 6.6 찜 추가

| 항목 | 내용 |
|------|------|
| **Method** | POST |
| **URL** | `/api/user/wishlist` |
| **인증** | Bearer (회원) |

**요청 (Body)**  
`{ "productId": string }`

**응답 (200)**  
`{ "success": true, "wishlist": {...} }` 또는 새로 생성된 wishlist 객체.

**에러**  
- 400: 상품 ID 필요  
- 401: 로그인 필요  
- 404: 상품 없음  
- 500: 찜 추가 오류

---

### 6.7 찜 삭제

| 항목 | 내용 |
|------|------|
| **Method** | DELETE |
| **URL** | `/api/user/wishlist/:productId` |
| **인증** | Bearer (회원) |

**응답 (200)**  
`{ "success": true }`

**에러**  
- 400: 상품 ID 필요  
- 401: 로그인 필요  
- 404: 찜 목록에 없음  
- 500: 삭제 오류

---

### 6.8 내 리뷰 목록

| 항목 | 내용 |
|------|------|
| **Method** | GET |
| **URL** | `/api/user/reviews` |
| **인증** | Bearer (회원) |

**응답 (200)**  
리뷰 배열 (product 포함).

---

### 6.9 리뷰 작성

| 항목 | 내용 |
|------|------|
| **Method** | POST |
| **URL** | `/api/user/reviews` |
| **인증** | Bearer (회원) |

**요청 (Body)**

| 필드 | 타입 | 필수 |
|------|------|------|
| productId | string | O |
| orderItemId | string | O |
| rating | number | O (1~5) |
| content | string | O |
| bodyType | string | - |
| petType | string | - DOG, CAT |
| imageUrls | string[] | - (최대 10개) |

**조건**  
구매 완료(PAYMENT_COMPLETED) 주문 항목에만 작성 가능, 1주문항목 1리뷰.

**응답 (200)**  
생성된 리뷰 객체 (imageUrls 배열 포함).

**에러**  
- 400: 필수값, 평점 1~5, 권한/구매완료/이미 작성 여부  
- 401: 로그인 필요  
- 403: 해당 주문 항목 권한 없음  
- 500: 리뷰 작성 오류

---

### 6.10 내 리뷰 수정

| 항목 | 내용 |
|------|------|
| **Method** | PATCH |
| **URL** | `/api/user/reviews/:id` |
| **인증** | Bearer (회원) |

**요청 (Body)**  
`{ "rating", "content", "bodyType", "petType", "imageUrls" }` (일부만 가능)

**응답 (200)**  
수정된 리뷰 객체.

**에러**  
- 400: 평점 1~5  
- 401: 로그인 필요  
- 404: 리뷰 없음  
- 500: 수정 오류

---

### 6.11 내 리뷰 삭제

| 항목 | 내용 |
|------|------|
| **Method** | DELETE |
| **URL** | `/api/user/reviews/:id` |
| **인증** | Bearer (회원) |

**응답 (200)**  
`{ "success": true }`

**에러**  
- 400: 리뷰 ID 필요  
- 401: 로그인 필요  
- 404: 리뷰 없음  
- 500: 삭제 오류

---

### 6.12 리뷰 작성 가능 여부

| 항목 | 내용 |
|------|------|
| **Method** | GET |
| **URL** | `/api/user/can-review?productId=:productId` |
| **인증** | Bearer (회원) |

**응답 (200)**  
- 작성 가능: `{ "canReview": true, "orderItemId": "string" }`  
- 불가: `{ "canReview": false, "error": "string" }`

**에러**  
- 400: productId 필요  
- 401: 로그인 필요 (canReview: false, error 포함)  
- 500: 조회 오류

---

### 6.13 내 반려동물 목록

| 항목 | 내용 |
|------|------|
| **Method** | GET |
| **URL** | `/api/user/pets` |
| **인증** | Bearer (회원) |

**응답 (200)**  
반려동물 배열.

---

### 6.14 반려동물 추가

| 항목 | 내용 |
|------|------|
| **Method** | POST |
| **URL** | `/api/user/pets` |
| **인증** | Bearer (회원) |

**요청 (Body)**  
`{ "name": string, "petType": "DOG"|"CAT", "breed", "bodyType", "birthDate" }`  
name, petType 필수.

**응답 (200)**  
생성된 pet 객체.

**에러**  
- 400: 이름/반려동물 종류 필수, petType DOG/CAT  
- 401: 로그인 필요  
- 500: 등록 오류

---

### 6.15 반려동물 수정

| 항목 | 내용 |
|------|------|
| **Method** | PATCH |
| **URL** | `/api/user/pets/:id` |
| **인증** | Bearer (회원) |

**요청 (Body)**  
`{ "name", "petType", "breed", "bodyType", "birthDate" }` (일부만 가능)

**응답 (200)**  
수정된 pet 객체.

**에러**  
- 400: petType DOG/CAT  
- 401: 로그인 필요  
- 404: 반려동물 없음  
- 500: 수정 오류

---

### 6.16 반려동물 삭제

| 항목 | 내용 |
|------|------|
| **Method** | DELETE |
| **URL** | `/api/user/pets/:id` |
| **인증** | Bearer (회원) |

**응답 (200)**  
`{ "success": true }`

**에러**  
- 400: ID 필요  
- 401: 로그인 필요  
- 404: 반려동물 없음  
- 500: 삭제 오류

---

### 6.17 내 상품 문의 목록

| 항목 | 내용 |
|------|------|
| **Method** | GET |
| **URL** | `/api/user/inquiries` |
| **인증** | Bearer (회원) |

**응답 (200)**  
`{ "inquiries": [ { id, productId, productName, productImageUrl, title, content, secret, answer, answeredAt, createdAt } ] }`

**에러**  
- 401: 로그인 필요  
- 500: 조회 오류

---

### 6.18 회원 이미지 업로드 (리뷰용)

| 항목 | 내용 |
|------|------|
| **Method** | POST |
| **URL** | `/api/user/upload` |
| **인증** | Bearer (회원) |
| **Content-Type** | multipart/form-data |

**요청**  
`files`: 이미지 (jpeg, png, webp, gif, 5MB 이하)

**응답 (200)**  
`{ "urls": [ "/uploads/...", ... ] }`

**에러**  
- 400: 파일 없음, 형식/크기 제한  
- 401: 로그인 필요  
- 500: 업로드 오류

---

## 7. 관리자(Admin) API — Bearer 인증

### 7.1 대시보드

| 항목 | 내용 |
|------|------|
| **Method** | GET |
| **URL** | `/api/admin/dashboard` |
| **인증** | Bearer (관리자) |

**응답 (200)**  
`{ partnersPending, partnersApproved, partnersTotal, productsPending, productsApproved, productsTotal, usersTotal, ordersTotal, ordersPaymentPending, ordersPaymentCompleted, ordersCancelled }`

**에러**  
- 401: 인증 필요  
- 500: 대시보드 조회 오류

---

### 7.2 공지사항 목록

| 항목 | 내용 |
|------|------|
| **Method** | GET |
| **URL** | `/api/admin/notices` |
| **인증** | Bearer (관리자) |

**응답 (200)**  
공지사항 배열.

---

### 7.3 공지사항 등록

| 항목 | 내용 |
|------|------|
| **Method** | POST |
| **URL** | `/api/admin/notices` |
| **인증** | Bearer (관리자) |

**요청 (Body)**  
`{ "type", "title", "content", "sortOrder" }` — title 필수.

**응답 (200)**  
생성된 notice 객체.

---

### 7.4 공지사항 수정

| 항목 | 내용 |
|------|------|
| **Method** | PATCH |
| **URL** | `/api/admin/notices/:id` |
| **인증** | Bearer (관리자) |

**요청 (Body)**  
`{ "type", "title", "content", "sortOrder" }`

**응답 (200)**  
수정된 notice 객체.

---

### 7.5 공지사항 삭제

| 항목 | 내용 |
|------|------|
| **Method** | DELETE |
| **URL** | `/api/admin/notices/:id` |
| **인증** | Bearer (관리자) |

**응답 (200)**  
`{ "success": true }`

---

### 7.6 FAQ 목록

| 항목 | 내용 |
|------|------|
| **Method** | GET |
| **URL** | `/api/admin/faq` |
| **인증** | Bearer (관리자) |

**응답 (200)**  
FAQ 배열.

---

### 7.7 FAQ 등록

| 항목 | 내용 |
|------|------|
| **Method** | POST |
| **URL** | `/api/admin/faq` |
| **인증** | Bearer (관리자) |

**요청 (Body)**  
`{ "category", "question", "answer", "sortOrder" }` — category: order, delivery, cancel, account, etc. question, answer 필수.

**응답 (200)**  
생성된 faq 객체.

---

### 7.8 FAQ 수정

| 항목 | 내용 |
|------|------|
| **Method** | PATCH |
| **URL** | `/api/admin/faq/:id` |
| **인증** | Bearer (관리자) |

**요청 (Body)**  
`{ "category", "question", "answer", "sortOrder" }`

**응답 (200)**  
수정된 faq 객체.

---

### 7.9 FAQ 삭제

| 항목 | 내용 |
|------|------|
| **Method** | DELETE |
| **URL** | `/api/admin/faq/:id` |
| **인증** | Bearer (관리자) |

**응답 (200)**  
`{ "success": true }`

---

### 7.10 카테고리 목록

| 항목 | 내용 |
|------|------|
| **Method** | GET |
| **URL** | `/api/admin/categories` |
| **인증** | Bearer (관리자) |

**요청 (Query)**  
`petType` (CAT이면 빈 배열)

**응답 (200)**  
카테고리 배열.

---

### 7.11 카테고리 등록

| 항목 | 내용 |
|------|------|
| **Method** | POST |
| **URL** | `/api/admin/categories` |
| **인증** | Bearer (관리자) |

**요청 (Body)**  
`{ "name", "slug", "petType", "sortOrder", "parentId" }` — name, petType 필수. petType CAT 추가 불가.

**응답 (200)**  
생성된 category 객체.

**에러**  
- 400: 이름/반려동물 타입 필수, slug/상위 카테고리 검증, 고양이 카테고리 추가 불가  
- 500: 카테고리 추가 오류 (P2002: slug 중복)

---

### 7.12 상품 목록

| 항목 | 내용 |
|------|------|
| **Method** | GET |
| **URL** | `/api/admin/products` |
| **인증** | Bearer (관리자) |

**요청 (Query)**  
`status` — PENDING, APPROVED, REJECTED (선택)

**응답 (200)**  
상품 배열 (partner, category, images 포함). CAT 제외.

---

### 7.13 상품 단건 조회

| 항목 | 내용 |
|------|------|
| **Method** | GET |
| **URL** | `/api/admin/products/:id` |
| **인증** | Bearer (관리자) |

**응답 (200)**  
상품 상세 (partner, category, images).

**에러**  
- 400: ID 필요  
- 404: 상품 없음  
- 500: 조회 오류

---

### 7.14 상품 승인/반려·상세·노출 수정

| 항목 | 내용 |
|------|------|
| **Method** | PATCH |
| **URL** | `/api/admin/products/:id` |
| **인증** | Bearer (관리자) |

**요청 (Body)**  
`{ "approvalStatus": "APPROVED"|"REJECTED", "rejectionReason", "detailContent", "detailTemplateType", "displayOrder" }`  
최소 1개 필드 필요. approvalStatus 반려 시 rejectionReason 권장.

**응답 (200)**  
수정된 상품 객체.

**에러**  
- 400: approvalStatus APPROVED/REJECTED, 수정 필드 없음  
- 401: 인증 필요  
- 404: 상품 없음  
- 500: 처리 오류

---

### 7.15 상품 노출 순서 일괄 저장

| 항목 | 내용 |
|------|------|
| **Method** | PATCH |
| **URL** | `/api/admin/products/order` |
| **인증** | Bearer (관리자) |

**요청 (Body)**  
`{ "productIds": [ "id1", "id2", ... ] }` — 순서대로 displayOrder 부여.

**응답 (200)**  
`{ "success": true }`

**에러**  
- 400: productIds 배열 필요  
- 404: 일부 상품 없음  
- 500: 순서 저장 오류

---

### 7.16 상품 상세 AI 생성 (관리자)

| 항목 | 내용 |
|------|------|
| **Method** | POST |
| **URL** | `/api/admin/products/:id/generate-detail` |
| **인증** | Bearer (관리자) |

**요청 (Body)**  
`{ "templateType", "inputSummary" }` (선택)

**응답 (200)**  
`{ "content", "templateType" }` — 저장은 하지 않음, PATCH로 반영.

**에러**  
- 400: 상품 ID 필요  
- 401: 인증 필요  
- 404: 상품 없음  
- 500: 생성 오류

---

### 7.17 입점업체 목록

| 항목 | 내용 |
|------|------|
| **Method** | GET |
| **URL** | `/api/admin/partners` |
| **인증** | Bearer (관리자) |

**요청 (Query)**  
`status` — PENDING, APPROVED, REJECTED (선택)

**응답 (200)**  
파트너 배열 (id, email, companyName, businessNumber, contactName, contactPhone, status, createdAt, _count.products).

---

### 7.18 입점업체 승인/반려

| 항목 | 내용 |
|------|------|
| **Method** | PATCH |
| **URL** | `/api/admin/partners/:id` |
| **인증** | Bearer (관리자) |

**요청 (Body)**  
`{ "status": "APPROVED"|"REJECTED" }`

**응답 (200)**  
수정된 partner 객체.

**에러**  
- 400: status APPROVED/REJECTED  
- 404: 입점업체 없음  
- 500: 처리 오류

---

### 7.19 주문 목록

| 항목 | 내용 |
|------|------|
| **Method** | GET |
| **URL** | `/api/admin/orders` |
| **인증** | Bearer (관리자) |

**요청 (Query)**  
`status` (PAYMENT_PENDING, PAYMENT_COMPLETED, CANCELLED), `dateFrom`, `dateTo` (YYYY-MM-DD)

**응답 (200)**  
주문 배열 (items, product, user 포함).

**에러**  
- 401: 인증 필요  
- 500: 조회 오류

---

### 7.20 주문 단건 조회

| 항목 | 내용 |
|------|------|
| **Method** | GET |
| **URL** | `/api/admin/orders/:id` |
| **인증** | Bearer (관리자) |

**응답 (200)**  
주문 상세 (items, product, user).

**에러**  
- 400: 주문 ID 필요  
- 404: 주문 없음  
- 500: 조회 오류

---

### 7.21 주문 상태 변경

| 항목 | 내용 |
|------|------|
| **Method** | PATCH |
| **URL** | `/api/admin/orders/:id` |
| **인증** | Bearer (관리자) |

**요청 (Body)**  
`{ "status": "PAYMENT_COMPLETED"|"CANCELLED" }`

**응답 (200)**  
`{ "message": "상태가 변경되었습니다." }`

**에러**  
- 400: status 유효값 아님  
- 404: 주문 없음  
- 500: 상태 변경 실패

---

### 7.22 1:1 문의 목록 (고객센터)

| 항목 | 내용 |
|------|------|
| **Method** | GET |
| **URL** | `/api/admin/one-to-one-inquiries` |
| **인증** | Bearer (관리자) |

**응답 (200)**  
category CUSTOMER_SERVICE 문의만. 각 항목: id, inquiryType, orderId, orderNumber, orderPhone, order, content, imageUrls, notifySms, notifyEmail, phone, email, status, answer, answeredAt, createdAt.

**에러**  
- 401: 인증 필요  
- 500: 조회 오류

---

### 7.23 1:1 문의 단건 조회

| 항목 | 내용 |
|------|------|
| **Method** | GET |
| **URL** | `/api/admin/one-to-one-inquiries/:id` |
| **인증** | Bearer (관리자) |

**응답 (200)**  
문의 상세. SELLER 문의는 403.

**에러**  
- 400: id 필요  
- 403: 입점업체 관리 문의  
- 404: 문의 없음  
- 500: 조회 오류

---

### 7.24 1:1 문의 답변 등록/수정

| 항목 | 내용 |
|------|------|
| **Method** | PATCH |
| **URL** | `/api/admin/one-to-one-inquiries/:id` |
| **인증** | Bearer (관리자) |

**요청 (Body)**  
`{ "answer": string }` — 비우면 pending.

**응답 (200)**  
`{ "id", "status", "answer", "answeredAt" }`

**에러**  
- 400: id 필요  
- 403: SELLER 문의  
- 404: 문의 없음  
- 500: 답변 저장 오류

---

### 7.25 메인 섹션 항목 목록

| 항목 | 내용 |
|------|------|
| **Method** | GET |
| **URL** | `/api/admin/home-sections?section=NEW_BEST|BEST` |
| **인증** | Bearer (관리자) |

**요청 (Query)**  
`section` — NEW_BEST 또는 BEST 필수.

**응답 (200)**  
HomeSectionItem 배열 (product 포함).

---

### 7.26 메인 섹션 상품 추가

| 항목 | 내용 |
|------|------|
| **Method** | POST |
| **URL** | `/api/admin/home-sections` |
| **인증** | Bearer (관리자) |

**요청 (Body)**  
`{ "section": "NEW_BEST"|"BEST", "productId": string }`

**응답 (200)**  
생성된 HomeSectionItem (product 포함).

**에러**  
- 400: section/productId 필요, 고양이 상품 불가, 이미 등록됨  
- 404: 상품 없음  
- 500: 추가 오류

---

### 7.27 메인 섹션 순서 일괄 저장

| 항목 | 내용 |
|------|------|
| **Method** | PATCH |
| **URL** | `/api/admin/home-sections` |
| **인증** | Bearer (관리자) |

**요청 (Body)**  
`{ "section": "NEW_BEST"|"BEST", "order": [ "itemId1", ... ] }`

**응답 (200)**  
해당 섹션 항목 배열 (정렬 반영).

**에러**  
- 400: section, order 배열 필요  
- 500: 순서 저장 오류

---

### 7.28 메인 섹션 항목 삭제

| 항목 | 내용 |
|------|------|
| **Method** | DELETE |
| **URL** | `/api/admin/home-sections/:id` |
| **인증** | Bearer (관리자) |

**응답 (200)**  
`{ "success": true }`

**에러**  
- 400: ID 필요  
- 404: 항목 없음  
- 500: 삭제 오류

---

### 7.29 카테고리 베스트 목록

| 항목 | 내용 |
|------|------|
| **Method** | GET |
| **URL** | `/api/admin/category-best?categoryId=:categoryId` |
| **인증** | Bearer (관리자) |

**요청 (Query)**  
`categoryId` 필수.

**응답 (200)**  
CategoryBestItem 배열 (category, product 포함).

---

### 7.30 카테고리 베스트 상품 추가

| 항목 | 내용 |
|------|------|
| **Method** | POST |
| **URL** | `/api/admin/category-best` |
| **인증** | Bearer (관리자) |

**요청 (Body)**  
`{ "categoryId", "productId" }`

**응답 (200)**  
생성된 CategoryBestItem.

**에러**  
- 400: categoryId/productId 필요, 해당 카테고리 상품만, 이미 등록  
- 404: 카테고리/상품 없음  
- 500: 추가 오류

---

### 7.31 카테고리 베스트 순서 일괄 저장

| 항목 | 내용 |
|------|------|
| **Method** | PATCH |
| **URL** | `/api/admin/category-best` |
| **인증** | Bearer (관리자) |

**요청 (Body)**  
`{ "categoryId", "order": [ "id1", ... ] }`

**응답 (200)**  
해당 categoryId 항목 배열.

**에러**  
- 400: categoryId, order 배열 필요  
- 500: 순서 저장 오류

---

### 7.32 카테고리 베스트 항목 삭제

| 항목 | 내용 |
|------|------|
| **Method** | DELETE |
| **URL** | `/api/admin/category-best/:id` |
| **인증** | Bearer (관리자) |

**응답 (200)**  
`{ "success": true }`

**에러**  
- 400: ID 필요  
- 404: 항목 없음  
- 500: 삭제 오류

---

### 7.33 함께 구매 추천 목록

| 항목 | 내용 |
|------|------|
| **Method** | GET |
| **URL** | `/api/admin/recommended?productId=:productId` |
| **인증** | Bearer (관리자) |

**요청 (Query)**  
`productId` 필수.

**응답 (200)**  
ProductRecommended 배열 (product, recommendedProduct 포함).

---

### 7.34 함께 구매 추천 추가

| 항목 | 내용 |
|------|------|
| **Method** | POST |
| **URL** | `/api/admin/recommended` |
| **인증** | Bearer (관리자) |

**요청 (Body)**  
`{ "productId", "recommendedProductId" }` — 동일 상품 불가.

**응답 (200)**  
생성된 ProductRecommended.

**에러**  
- 400: productId/recommendedProductId 필요, 같은 상품 불가, 이미 등록  
- 404: 상품 없음  
- 500: 추가 오류

---

### 7.35 함께 구매 추천 순서 일괄 저장

| 항목 | 내용 |
|------|------|
| **Method** | PATCH |
| **URL** | `/api/admin/recommended` |
| **인증** | Bearer (관리자) |

**요청 (Body)**  
`{ "productId", "order": [ "id1", ... ] }`

**응답 (200)**  
해당 productId 추천 목록.

**에러**  
- 400: productId, order 배열 필요  
- 500: 순서 저장 오류

---

### 7.36 함께 구매 추천 항목 삭제

| 항목 | 내용 |
|------|------|
| **Method** | DELETE |
| **URL** | `/api/admin/recommended/:id` |
| **인증** | Bearer (관리자) |

**응답 (200)**  
`{ "success": true }`

**에러**  
- 400: ID 필요  
- 404: 항목 없음  
- 500: 삭제 오류

---

### 7.37 큐레이션 목록

| 항목 | 내용 |
|------|------|
| **Method** | GET |
| **URL** | `/api/admin/curation` |
| **인증** | Bearer (관리자) |

**응답 (200)**  
CurationItem 배열 (product 포함).

---

### 7.38 큐레이션 상품 추가

| 항목 | 내용 |
|------|------|
| **Method** | POST |
| **URL** | `/api/admin/curation` |
| **인증** | Bearer (관리자) |

**요청 (Body)**  
`{ "productId": string }`

**응답 (200)**  
생성된 CurationItem (product 포함).

**에러**  
- 400: productId 필요, 이미 포함  
- 404: 상품 없음  
- 500: 추가 오류

---

### 7.39 큐레이션 순서 일괄 저장

| 항목 | 내용 |
|------|------|
| **Method** | PATCH |
| **URL** | `/api/admin/curation` |
| **인증** | Bearer (관리자) |

**요청 (Body)**  
`{ "order": [ "id1", ... ] }`

**응답 (200)**  
큐레이션 항목 배열.

**에러**  
- 400: order 배열 필요  
- 500: 순서 저장 오류

---

### 7.40 큐레이션 항목 삭제

| 항목 | 내용 |
|------|------|
| **Method** | DELETE |
| **URL** | `/api/admin/curation/:id` |
| **인증** | Bearer (관리자) |

**응답 (200)**  
`{ "success": true }`

**에러**  
- 400: ID 필요  
- 404: 항목 없음  
- 500: 삭제 오류

---

### 7.41 배너 목록

| 항목 | 내용 |
|------|------|
| **Method** | GET |
| **URL** | `/api/admin/banners` |
| **인증** | Bearer (관리자) |

**응답 (200)**  
배너 배열.

---

### 7.42 배너 추가

| 항목 | 내용 |
|------|------|
| **Method** | POST |
| **URL** | `/api/admin/banners` |
| **인증** | Bearer (관리자) |

**요청 (Body)**  
`{ "imageUrl", "linkUrl", "title", "description", "sortOrder", "isActive" }` — imageUrl 필수.

**응답 (200)**  
생성된 banner 객체.

**에러**  
- 400: imageUrl 필수  
- 500: 배너 추가 오류

---

### 7.43 배너 수정

| 항목 | 내용 |
|------|------|
| **Method** | PATCH |
| **URL** | `/api/admin/banners/:id` |
| **인증** | Bearer (관리자) |

**요청 (Body)**  
`{ "imageUrl", "linkUrl", "title", "description", "sortOrder", "isActive" }`

**응답 (200)**  
수정된 banner 객체.

**에러**  
- 400: ID 필요  
- 404: 배너 없음  
- 500: 수정 오류

---

### 7.44 배너 삭제

| 항목 | 내용 |
|------|------|
| **Method** | DELETE |
| **URL** | `/api/admin/banners/:id` |
| **인증** | Bearer (관리자) |

**응답 (200)**  
`{ "success": true }`

**에러**  
- 400: ID 필요  
- 404: 배너 없음  
- 500: 삭제 오류

---

### 7.45 관리자 이미지 업로드

| 항목 | 내용 |
|------|------|
| **Method** | POST |
| **URL** | `/api/admin/upload` |
| **인증** | Bearer (관리자) |
| **Content-Type** | multipart/form-data |

**요청**  
`files`: 이미지 (jpeg, png, webp, gif, 5MB 이하)

**응답 (200)**  
`{ "urls": [ "/uploads/...", ... ] }`

**에러**  
- 400: 파일 없음, 형식/크기 제한  
- 401: 인증 필요  
- 500: 업로드 오류

---

### 7.46 고객센터 설정 조회

| 항목 | 내용 |
|------|------|
| **Method** | GET |
| **URL** | `/api/admin/customer-center/settings` |
| **인증** | Bearer (관리자) |

**응답 (200)**  
1:1 문의 설정 객체.

**에러**  
- 401: 인증 필요  
- 500: 설정 조회 오류

---

### 7.47 고객센터 설정 수정

| 항목 | 내용 |
|------|------|
| **Method** | PATCH |
| **URL** | `/api/admin/customer-center/settings` |
| **인증** | Bearer (관리자) |

**요청 (Body)**  
설정 필드 객체 (구현에 따라 다름).

**응답 (200)**  
저장 후 설정 객체.

**에러**  
- 401: 인증 필요  
- 500: 설정 저장 오류

---

## 8. 파트너(Partner) API — Bearer 인증

### 8.1 파트너 정보 조회

| 항목 | 내용 |
|------|------|
| **Method** | GET |
| **URL** | `/api/partner/me` |
| **인증** | Bearer (파트너) |

**응답 (200)**  
`{ "partner": { "id", "email", "companyName", "businessNumber", "contactName", "contactPhone", "status", "createdAt" } }`

**에러**  
- 401: 인증 필요 / 입점업체 없음  
- 500: 조회 오류

---

### 8.2 파트너 정보 수정

| 항목 | 내용 |
|------|------|
| **Method** | PATCH |
| **URL** | `/api/partner/me` |
| **인증** | Bearer (파트너) |

**요청 (Body)**  
`{ "companyName", "contactName", "contactPhone" }` — 업체명 변경 시 status → PENDING(재승인).

**응답 (200)**  
`{ "partner": {...}, "requiresReapproval": boolean }`

**에러**  
- 401: 인증 필요 / 입점업체 없음  
- 500: 수정 오류

---

### 8.3 대시보드

| 항목 | 내용 |
|------|------|
| **Method** | GET |
| **URL** | `/api/partner/dashboard` |
| **인증** | Bearer (파트너) |

**응답 (200)**  
`{ "totalProducts", "pendingProducts", "monthRevenue", "settlementPending" }`

**에러**  
- 401: 인증 필요  
- 500: 대시보드 조회 오류

---

### 8.4 내 상품 목록

| 항목 | 내용 |
|------|------|
| **Method** | GET |
| **URL** | `/api/partner/products` |
| **인증** | Bearer (파트너) |

**응답 (200)**  
본인 상품 배열 (category, images 포함).

**에러**  
- 401: 인증 필요 / 입점업체 없음  
- 500: 목록 조회 오류

---

### 8.5 상품 등록

| 항목 | 내용 |
|------|------|
| **Method** | POST |
| **URL** | `/api/partner/products` |
| **인증** | Bearer (파트너, APPROVED만) |

**요청 (Body)**  
name, brand, categoryId, basePrice 필수. totalStock, description, shippingMethod, shippingPeriod, shippingNote, shippingFee, manufacturer, countryOfOrigin, returnAddress, sizeOption, colorOption, sizePrices(객체), mainImageUrls(배열), detailImageUrls(배열), modelName 등.  
고양이 카테고리 불가. 등록 시 approvalStatus PENDING.

**응답 (200)**  
생성된 상품 (category, images 포함).

**에러**  
- 400: 필수값, 가격/재고 검증, 카테고리/고양이 제한  
- 401: 인증 필요 / 입점업체 없음  
- 403: 승인된 입점업체만 등록 가능  
- 500: 상품 등록 오류

---

### 8.6 내 상품 단건 조회

| 항목 | 내용 |
|------|------|
| **Method** | GET |
| **URL** | `/api/partner/products/:id` |
| **인증** | Bearer (파트너) |

**응답 (200)**  
본인 상품만 (category, images, variants 포함).

**에러**  
- 400: 상품 ID 필요  
- 401: 인증 필요 / 입점업체 없음  
- 404: 상품 없음  
- 500: 조회 오류

---

### 8.7 내 상품 수정

| 항목 | 내용 |
|------|------|
| **Method** | PATCH |
| **URL** | `/api/partner/products/:id` |
| **인증** | Bearer (파트너) |

**요청 (Body)**  
상품 등록과 동일 필드. detailContent, detailTemplateType만 보내면 상세만 업데이트(예: AI 생성 후 저장).

**응답 (200)**  
수정된 상품 (category, images 포함).

**에러**  
- 400: 필수값, 가격/재고/카테고리 검증  
- 401: 인증 필요 / 입점업체 없음  
- 404: 상품 없음  
- 500: 수정 오류

---

### 8.8 내 상품 삭제

| 항목 | 내용 |
|------|------|
| **Method** | DELETE |
| **URL** | `/api/partner/products/:id` |
| **인증** | Bearer (파트너) |

**조건**  
주문 내역이 있으면 삭제 불가.

**응답 (200)**  
`{ "message": "상품이 삭제되었습니다." }`

**에러**  
- 400: 상품 ID 필요, 주문 내역 있음  
- 401: 인증 필요 / 입점업체 없음  
- 404: 상품 없음  
- 500: 삭제 오류

---

### 8.9 상품 상세 AI 생성

| 항목 | 내용 |
|------|------|
| **Method** | POST |
| **URL** | `/api/partner/products/:id/generate-detail` |
| **인증** | Bearer (파트너) |

**요청 (Body)**  
`{ "templateType", "inputSummary" }` (선택)

**응답 (200)**  
`{ "content", "templateType" }` — 저장하지 않음, PATCH로 저장.

**에러**  
- 400: 상품 ID 필요  
- 401: 인증 필요 / 입점업체 없음  
- 404: 상품 없음  
- 500: 생성 오류

---

### 8.10 주문 목록 (본인 상품 포함 주문)

| 항목 | 내용 |
|------|------|
| **Method** | GET |
| **URL** | `/api/partner/orders` |
| **인증** | Bearer (파트너) |

**응답 (200)**  
`[ { "id", "orderNumber", "status", "totalAmount", "createdAt", "paidAt", "partnerItems", "partnerAmount" }, ... ]`

**에러**  
- 401: 인증 필요  
- 500: 목록 조회 오류

---

### 8.11 정산 요약

| 항목 | 내용 |
|------|------|
| **Method** | GET |
| **URL** | `/api/partner/settlement` |
| **인증** | Bearer (파트너) |

**응답 (200)**  
`{ "totalAmount", "summary": [ { "orderNumber", "paidAt", "amount" }, ... ] }`

**에러**  
- 401: 인증 필요  
- 500: 정산 조회 오류

---

### 8.12 내 상품 문의 목록

| 항목 | 내용 |
|------|------|
| **Method** | GET |
| **URL** | `/api/partner/inquiries` |
| **인증** | Bearer (파트너) |

**응답 (200)**  
`{ "inquiries": [ { id, productId, productName, productImageUrl, title, content, secret, answer, answeredAt, createdAt, writerName, writerEmail }, ... ] }`

**에러**  
- 401: 인증 필요  
- 500: 목록 조회 오류

---

### 8.13 상품 문의 답변 등록/수정

| 항목 | 내용 |
|------|------|
| **Method** | PATCH |
| **URL** | `/api/partner/inquiries/:id` |
| **인증** | Bearer (파트너) |

**요청 (Body)**  
`{ "answer": string }` — 필수, 2000자 이내.

**응답 (200)**  
`{ "message": "답변이 등록되었습니다." }`

**에러**  
- 400: 답변 내용 필수  
- 401: 인증 필요  
- 403: 해당 문의 답변 권한 없음  
- 404: 문의 없음  
- 500: 답변 등록 오류

---

### 8.14 파트너 이미지 업로드

| 항목 | 내용 |
|------|------|
| **Method** | POST |
| **URL** | `/api/partner/upload` |
| **인증** | Bearer (파트너, APPROVED만) |
| **Content-Type** | multipart/form-data |

**요청**  
`files`: 이미지 (jpeg, png, webp, gif, 5MB 이하)

**응답 (200)**  
`{ "urls": [ "/uploads/...", ... ] }`

**에러**  
- 400: 파일 없음, 형식/크기 제한  
- 401: 인증 필요  
- 403: 승인된 입점업체만 업로드 가능  
- 500: 업로드 오류

---

## 공통 에러 형식

- **4xx/5xx**: `{ "error": "메시지" }`  
- **401**: 인증 필요  
- **403**: 권한 없음  
- **404**: 리소스 없음  
- **500**: 서버 오류 (메시지로 사유 표시)

---

*문서 생성일: 프로젝트 API 라우트 및 클라이언트 호출 기준.*
