# api — 자사 API

**Prisma·DB 연동** 자사 백엔드 API만 두는 폴더입니다. 목업이 아닌 실제 동작 API입니다.

- **경로**: `/api/...`
- **목업이 필요할 때**: 동일 기능 목업은 `src/app/api-mock/` 참고.

---

## 자사 API 목록 (목 API 아님)

| 영역 | Method | 경로 | 비고 |
|------|--------|------|------|
| **인증** | POST | `/api/auth/login` | 일반 로그인 |
| | POST | `/api/auth/signup` | 회원가입 |
| | POST | `/api/auth/admin-login` | 관리자 로그인 |
| **입점업체** | POST | `/api/partner/auth/login` | 입점업체 로그인 |
| | POST | `/api/partner/auth/register` | 입점업체 가입 |
| | GET | `/api/partner/me` | 입점업체 내 정보 |
| | GET | `/api/partner/dashboard` | 입점업체 대시보드 |
| | GET | `/api/partner/orders` | 입점업체 주문 |
| | GET | `/api/partner/settlement` | 입점업체 정산 |
| | GET | `/api/partner/products` | 입점업체 상품 목록 |
| | POST | `/api/partner/products` | 상품 등록 |
| | GET | `/api/partner/products/[id]` | 상품 상세 |
| | PATCH | `/api/partner/products/[id]` | 상품 수정 |
| | POST | `/api/partner/products/[id]/generate-detail` | AI 상세 생성 |
| | GET | `/api/partner/inquiries` | 문의 목록 |
| | GET | `/api/partner/inquiries/[id]` | 문의 상세 |
| | POST | `/api/partner/upload` | 파일 업로드 |
| **공개·메인** | GET | `/api/brands` | 브랜드 목록 |
| | GET | `/api/categories` | 카테고리 목록 |
| | GET | `/api/products` | 상품 목록 |
| | GET | `/api/products/[id]` | 상품 상세 |
| | GET | `/api/products/[id]/category-best` | 카테고리별 베스트 |
| | GET | `/api/products/[id]/recommended` | 추천 상품 |
| | GET | `/api/products/[id]/reviews` | 상품 리뷰 |
| | GET | `/api/products/[id]/inquiries` | 상품 문의 |
| | GET | `/api/banners` | 배너 목록 |
| | GET | `/api/home-sections` | 홈 섹션 |
| | GET | `/api/curation` | 큐레이션 |
| | GET | `/api/faq` | FAQ |
| | GET | `/api/notices` | 공지 목록 |
| **회원(유저)** | GET | `/api/user/me` | 내 정보 |
| | GET | `/api/user/orders` | 주문 목록 |
| | GET | `/api/user/orders/[id]` | 주문 상세 |
| | GET | `/api/user/pets` | 반려동물 목록 |
| | POST | `/api/user/pets` | 반려동물 등록 |
| | PATCH | `/api/user/pets/[id]` | 반려동물 수정 |
| | DELETE | `/api/user/pets/[id]` | 반려동물 삭제 |
| | GET | `/api/user/wishlist` | 찜 목록 |
| | POST | `/api/user/wishlist/[productId]` | 찜 추가/삭제 |
| | GET | `/api/user/reviews` | 내 리뷰 목록 |
| | GET | `/api/user/reviews/[id]` | 리뷰 상세 |
| | GET | `/api/user/can-review` | 리뷰 작성 가능 여부 |
| | GET | `/api/user/inquiries` | 내 문의 목록 |
| | POST | `/api/user/upload` | 파일 업로드 |
| **장바구니** | GET | `/api/cart` | 장바구니 조회 |
| | POST | `/api/cart` | 장바구니 항목 추가 등 |
| | PATCH/DELETE | `/api/cart/items/[itemId]` | 장바구니 항목 수정/삭제 |
| **주문** | POST | `/api/orders` | 주문 생성 |
| | GET | `/api/orders/lookup` | 비회원 주문 조회 |
| | GET | `/api/orders/[id]` | 주문 상세 |
| | POST | `/api/orders/[id]/pay` | 결제 |
| | POST | `/api/orders/[id]/cancel` | 주문 취소 |
| **문의** | POST | `/api/inquiry` | 1:1 문의 등록 |
| | GET | `/api/inquiry/my` | 내 문의 |
| | POST | `/api/inquiry/upload` | 문의 첨부 업로드 |
| **고객센터** | GET | `/api/customer-center/settings` | 고객센터 설정 |
| **관리자** | GET | `/api/admin/dashboard` | 대시보드 |
| | GET/POST | `/api/admin/partners` | 입점업체 목록/처리 |
| | GET/PATCH | `/api/admin/partners/[id]` | 입점업체 상세/승인·반려 |
| | GET/POST | `/api/admin/products` | 상품 목록/처리 |
| | GET/PATCH | `/api/admin/products/[id]` | 상품 상세/승인·반려 |
| | POST | `/api/admin/products/[id]/generate-detail` | AI 상세 생성 |
| | PATCH | `/api/admin/products/order` | 상품 노출 순서 |
| | GET | `/api/admin/categories` | 카테고리 관리 |
| | GET/POST | `/api/admin/category-best` | 카테고리별 베스트 관리 |
| | GET/PATCH/DELETE | `/api/admin/category-best/[id]` | 카테고리별 베스트 항목 |
| | GET/POST | `/api/admin/recommended` | 추천 상품 관리 |
| | GET/PATCH/DELETE | `/api/admin/recommended/[id]` | 추천 상품 항목 |
| | GET/POST | `/api/admin/banners` | 배너 관리 |
| | GET/PATCH/DELETE | `/api/admin/banners/[id]` | 배너 항목 |
| | GET/POST | `/api/admin/home-sections` | 홈 섹션 관리 |
| | GET/PATCH/DELETE | `/api/admin/home-sections/[id]` | 홈 섹션 항목 |
| | GET/POST | `/api/admin/curation` | 큐레이션 관리 |
| | GET/PATCH/DELETE | `/api/admin/curation/[id]` | 큐레이션 항목 |
| | GET/POST | `/api/admin/faq` | FAQ 관리 |
| | GET/PATCH/DELETE | `/api/admin/faq/[id]` | FAQ 항목 |
| | GET/POST | `/api/admin/notices` | 공지 관리 |
| | GET/PATCH/DELETE | `/api/admin/notices/[id]` | 공지 항목 |
| | GET/POST | `/api/admin/one-to-one-inquiries` | 1:1 문의 관리 |
| | GET/PATCH | `/api/admin/one-to-one-inquiries/[id]` | 1:1 문의 항목 |
| | GET/POST | `/api/admin/orders` | 주문 관리 |
| | GET/PATCH | `/api/admin/orders/[id]` | 주문 상세 |
| | POST | `/api/admin/upload` | 관리자 업로드 |
| | GET/PATCH | `/api/admin/customer-center/settings` | 고객센터 설정 |

---

- **타사 API**: `src/app/api-etc/`
- **프론트 자체해결 API**: `src/app/api-local/`
- **목업 API**: `src/app/api-mock/`
