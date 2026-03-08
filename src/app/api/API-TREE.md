# API 폴더 트리 (최종)

- **api/seller**: 삭제 완료. 입점업체 API는 `/api/partner` 로만 사용.
- **api/products**: 일반 사용자(공개) — 승인(APPROVED) 상품 목록·상세·리뷰.
- **api/partner/products**: 입점업체 전용 — 본인 상품 목록·등록·수정·AI 상세 생성 (인증 필수).
- 중복 엔드포인트 없음.

```
api/
├── admin/                          # 관리자 (adminToken)
│   ├── banners/
│   │   ├── [id]/route.js
│   │   └── route.js
│   ├── curation/
│   │   ├── [id]/route.js
│   │   └── route.js
│   ├── dashboard/route.js
│   ├── partners/
│   │   ├── [id]/route.js
│   │   └── route.js
│   └── products/
│       ├── [id]/
│       │   ├── generate-detail/route.js
│       │   └── route.js
│       ├── order/route.js
│       └── route.js
├── auth/                           # 공통 인증
│   ├── admin-login/route.js
│   ├── login/route.js
│   └── signup/route.js
├── banners/route.js
├── cart/
│   ├── items/[itemId]/route.js
│   └── route.js
├── categories/route.js
├── curation/route.js
├── orders/
│   ├── [id]/
│   │   ├── cancel/route.js
│   │   ├── pay/route.js
│   │   └── route.js
│   └── route.js
├── partner/                        # 입점업체 (partnerToken)
│   ├── auth/login/route.js
│   ├── dashboard/route.js
│   ├── me/route.js
│   ├── orders/route.js
│   ├── products/
│   │   ├── [id]/
│   │   │   ├── generate-detail/route.js
│   │   │   └── route.js
│   │   └── route.js
│   ├── settlement/route.js
│   └── upload/route.js
├── products/                       # 공개 상품 (일반 사용자)
│   ├── [id]/
│   │   ├── reviews/route.js
│   │   └── route.js
│   └── route.js
└── user/                           # 로그인 사용자 (userToken)
    ├── me/route.js
    ├── orders/
    │   ├── [id]/route.js
    │   └── route.js
    ├── pets/
    │   ├── [id]/route.js
    │   └── route.js
    ├── reviews/
    │   ├── [id]/route.js
    │   └── route.js
    ├── upload/route.js
    └── wishlist/
        ├── [productId]/route.js
        └── route.js
```
