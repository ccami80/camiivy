# App 라우트 구조 (역할 기반)

관리자(admin), 사용자(user), 파트너(partner) 3권한 체계에 맞춘 폴더 구조입니다.

## 페이지 (역할별 Route Group)

| Route Group | 경로 prefix | 설명 |
|-------------|-------------|------|
| **`(admin)/admin/`** | `/admin/*` | 관리자: 대시보드, 입점업체·상품·주문 관리, 배너·큐레이션 등 |
| **`(partner)/partner/`** | `/partner/*` | 입점업체(파트너): 로그인, 대시보드, 상품·주문·정산 |
| **`(user)/my/`** | `/my/*` | 로그인 사용자: 마이페이지, 주문/리뷰/위시리스트/반려동물/프로필 |
| **`(website)/`** | (공개 경로) | 비로그인 공개: 메인, 로그인/회원가입, 상품·장바구니·결제, 정책 페이지 |

- Route Group `(이름)` 은 URL에 포함되지 않으며, 폴더만 역할별로 구분합니다.
- 실제 URL은 위 표의 경로 prefix대로 노출됩니다.

## API (`api/`)

- **`api/admin/*`** — 관리자 전용 API (인증: adminToken)
- **`api/partner/*`** — 입점업체(파트너) 전용 API (인증: partnerToken). 입점업체 관련 API는 모두 `/api/partner` 로만 사용합니다. (`api/seller` 삭제 완료·미사용)
- **`api/user/*`** — 사용자 전용 API (인증: userToken)
- **`api/auth/*`** — 공통 인증 (관리자 로그인, 사용자 로그인/회원가입). 파트너 로그인은 **`POST /api/partner/auth/login`** 만 사용합니다.

**상품 API 역할 구분**
- **`api/products`** — 일반 사용자(공개): 승인(APPROVED) 상품 목록·상세·리뷰. 역할 겹침 없음.
- **`api/partner/products`** — 입점업체 전용: 본인 상품 목록·등록·수정·AI 상세 생성. 인증 필수.

공개·공통 API(장바구니, 주문, 카테고리, 배너, 큐레이션 등)는 `api/` 하위에 역할 prefix 없이 두었습니다.

### API 트리 구조 (최종)

```
api/
├── admin/                    # 관리자 전용
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
├── auth/                     # 공통 인증 (파트너 로그인 제외)
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
├── partner/                  # 입점업체 전용 (통일)
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
├── products/                 # 공개 상품 (사용자용)
│   ├── [id]/
│   │   ├── reviews/route.js
│   │   └── route.js
│   └── route.js
└── user/                     # 로그인 사용자 전용
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
