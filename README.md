# CAMI & IVY

강아지 · 고양이 프리미엄 반려동물 이커머스 플랫폼

## 기술 스택

- Next.js (App Router), JavaScript, Tailwind CSS
- MySQL, Prisma, JWT 인증

## 구현 방식 제약 (필수)

- **JavaScript** 기준 (TypeScript 미사용)
- **Next.js App Router** + **API Routes** 사용
- **Prisma ORM** + **MySQL** 기준 (로컬 개발은 SQLite 가능)
- **실제 동작하는 CRUD**만 구현 (가짜 데이터·정적 화면만 있는 구현 금지)
- **페이지와 API를 함께 구현** (목업/가짜 데이터만 있는 화면 금지)

상세: `prd/05-구현-방식-제약.md` 참고.

## 관리자 페이지

- **관리자 로그인** — `/admin/login`
- **관리자 대시보드** — `/admin` (입점업체·상품 요약 지표)
- **입점업체 목록 조회** — `/admin/partners` (전체/승인 대기/승인됨/반려 필터)
- **입점업체 승인·반려** — `/admin/partners`에서 버튼으로 처리
- **상품 목록 조회** — `/admin/products` (전체/승인 대기/승인됨/반려 필터)
- **상품 승인·반려** — `/admin/products`에서 버튼으로 처리 (입점업체 상품과 연동)

### 관리자 로그인 (시드 계정)

- 이메일: `admin@cami-ivy.com`
- 비밀번호: `admin1234`

(시드 실행 후 사용 가능)

## 실행 방법

### 1. DB 설정 (MySQL)

`.env` 파일을 만들고 MySQL 연결 정보를 넣습니다.

```bash
cp .env.example .env
# .env 편집
DATABASE_URL="mysql://USER:PASSWORD@HOST:3306/cami_ivy"
JWT_SECRET="원하는_시크릿_문자열"
```

MySQL에 `cami_ivy` 데이터베이스를 생성한 뒤:

```bash
npm run db:migrate   # 마이그레이션 적용
npm run db:seed      # 관리자·입점업체·카테고리·상품 시드
```

### 2. 개발 서버

```bash
npm run dev
```

- 메인: http://localhost:3000
- 관리자 로그인: http://localhost:3000/admin/login

### 3. 빌드

```bash
npm run build
npm start
```

## 프로젝트 구조

- `src/app/admin/` — 관리자 페이지 (로그인, 대시보드, 입점업체, 상품 승인)
- `src/app/api/auth/admin-login` — 관리자 로그인 API
- `src/app/api/admin/` — 대시보드, 입점업체, 상품 API
- `prisma/schema.prisma` — Admin, Partner, Category, Product 등
- `prisma/seed.js` — 초기 관리자·입점업체·상품 데이터

## 입점업체·상품 승인·반려

- **입점업체**: `/admin/partners`에서 상태별 필터 후 **승인**·**반려** 버튼으로 처리.
- **상품**: `/admin/products`에서 입점업체별 상품 목록을 보고 **승인**·**반려** 처리. 상태값 `PENDING` / `APPROVED` / `REJECTED` 사용.
- 데이터는 Prisma(SQLite 로컬)에 저장되며, mock이 아닌 실제 동작 기준입니다.

## 입점업체 상품 등록

- **입점업체 로그인**: `/partner/login` (시드: `partner1@example.com` / `partner1234`, 승인됨)
- **상품 등록 폼**: `/partner/products/new` — 상품명, 브랜드(CAMI/IVY), 반려동물 타입, 카테고리, 가격, 재고, 설명, 배송 정보 입력 후 등록. 등록 시 `approvalStatus: PENDING`으로 저장되며, 관리자가 `/admin/products`에서 승인/반려 처리.
- **상품 목록**: `/partner/products` — 내가 등록한 상품 목록 조회.
- **API**: `POST /api/partner/products` (JWT 필수, 승인된 입점업체만), `GET /api/categories` (카테고리 목록).
