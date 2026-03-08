# CAMI & IVY — DB 스키마 설계 (Prisma + MySQL)

> JavaScript 프로젝트 기준, TypeScript 미사용. Prisma Client 사용 시 `@prisma/client`만 사용.

---

## 1. 사용 기술

- **DB**: MySQL
- **ORM**: Prisma
- **언어**: JavaScript (schema.prisma는 Prisma DSL)

---

## 2. 스키마 개요

| 영역 | 모델 | 설명 |
|------|------|------|
| 인증·권한 | User, Partner, Admin | 일반회원, 입점업체, 관리자 (각각 별도 테이블·로그인 분리 가능) |
| 상품 | Category, Product, ProductImage, ProductOption, ProductVariant | 카테고리, 상품, 이미지, 옵션(사이즈/색상), 옵션별 재고 |
| 주문·결제 | Order, OrderItem | 주문, 주문 상세 |
| 장바구니 | Cart, CartItem | 장바구니(회원/비회원 세션), 장바구니 항목 |
| 마이페이지 | Pet, Address, PointHistory | 반려동물 프로필, 배송지, 포인트 내역 |
| 리뷰·찜 | Review, Wishlist | 리뷰, 찜 목록 |
| 쿠폰 | Coupon, UserCoupon | 쿠폰 마스터, 회원별 보유·사용 |
| 메인 | Curation | 메인 큐레이션(배너·상품·순서) |

---

## 3. Prisma Schema 전체 (schema.prisma)

아래 내용을 `prisma/schema.prisma` 파일로 두고 사용한다.

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

// ========== 인증·권한 ==========

model User {
  id           String   @id @default(cuid())
  email        String   @unique
  passwordHash String   @map("password_hash")
  name         String
  phone        String?
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")

  addresses    Address[]
  carts        Cart[]
  orders       Order[]
  pets         Pet[]
  pointHistory PointHistory[]
  reviews      Review[]
  userCoupons  UserCoupon[]
  wishlists    Wishlist[]

  @@map("users")
}

model Partner {
  id             String       @id @default(cuid())
  email          String       @unique
  passwordHash   String       @map("password_hash")
  companyName    String       @map("company_name")
  businessNumber String       @map("business_number")
  contactName    String       @map("contact_name")
  contactPhone   String       @map("contact_phone")
  status         PartnerStatus @default(PENDING)
  createdAt      DateTime     @default(now()) @map("created_at")
  updatedAt      DateTime     @updatedAt @map("updated_at")

  products  Product[]
  orders    Order[]    // 입점업체별 주문은 OrderItem → Product → partnerId로 조회 가능
  settlements Settlement[]

  @@map("partners")
}

enum PartnerStatus {
  PENDING
  APPROVED
  REJECTED
}

model Admin {
  id           String   @id @default(cuid())
  email        String   @unique
  passwordHash String   @map("password_hash")
  name         String
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")

  @@map("admins")
}

// ========== 카테고리·상품 ==========

model Category {
  id        String   @id @default(cuid())
  name      String
  slug      String   @unique
  petType   PetType  @map("pet_type")  // DOG, CAT, BOTH
  sortOrder Int      @default(0) @map("sort_order")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  products Product[]
}

enum PetType {
  DOG
  CAT
}

model Product {
  id                String            @id @default(cuid())
  partnerId         String            @map("partner_id")
  name              String
  brand             Brand
  petType           PetType           @map("pet_type")
  categoryId        String            @map("category_id")
  basePrice         Int               @map("base_price")   // 원 단위
  totalStock        Int               @default(0) @map("total_stock")
  description       String?           @db.Text
  detailContent     String?           @map("detail_content") @db.LongText  // AI 생성 상세 HTML
  detailTemplateType DetailTemplateType? @map("detail_template_type")
  shippingInfo      String?           @map("shipping_info") @db.Text
  approvalStatus   ProductApprovalStatus @default(PENDING) @map("approval_status")
  createdAt         DateTime          @default(now()) @map("created_at")
  updatedAt         DateTime          @updatedAt @map("updated_at")

  category   Category         @relation(fields: [categoryId], references: [id], onDelete: Restrict)
  partner    Partner          @relation(fields: [partnerId], references: [id], onDelete: Restrict)
  images     ProductImage[]
  options    ProductOption[]
  variants   ProductVariant[]
  cartItems  CartItem[]
  orderItems OrderItem[]
  reviews    Review[]
  wishlists  Wishlist[]
  curationItems CurationItem[]

  @@map("products")
}

enum Brand {
  CAMI
  IVY
}

enum DetailTemplateType {
  LIFESTYLE   // 프리미엄 라이프스타일형
  FUNCTIONAL  // 기능 중심 설득형
  EMOTIONAL   // 감성 공감형
}

enum ProductApprovalStatus {
  PENDING
  APPROVED
  REJECTED
}

model ProductImage {
  id        String   @id @default(cuid())
  productId String   @map("product_id")
  url       String
  sortOrder Int      @default(0) @map("sort_order")
  createdAt DateTime @default(now()) @map("created_at")

  product Product @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@map("product_images")
}

model ProductOption {
  id        String   @id @default(cuid())
  productId String   @map("product_id")
  name      String   // "사이즈", "색상" 등
  value     String   // "S", "M", "L" / "빨강", "네이비"
  sortOrder Int      @default(0) @map("sort_order")

  product Product @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@map("product_options")
}

model ProductVariant {
  id          String   @id @default(cuid())
  productId   String   @map("product_id")
  optionLabel String   @map("option_label")  // "S / 빨강" 등 조합 표시용
  quantity    Int      @default(0)           // 해당 옵션 조합 재고
  priceAdjust Int      @default(0) @map("price_adjust")  // 원 단위 가격 가감

  product   Product    @relation(fields: [productId], references: [id], onDelete: Cascade)
  cartItems CartItem[]
  orderItems OrderItem[]

  @@map("product_variants")
}

// ========== 주문 ==========

model Order {
  id               String      @id @default(cuid())
  orderNumber      String      @unique @map("order_number")
  userId           String?     @map("user_id")
  status           OrderStatus @default(PENDING_PAYMENT)
  totalAmount      Int         @map("total_amount")
  discountAmount   Int         @default(0) @map("discount_amount")
  shippingAmount  Int         @default(0) @map("shipping_amount")
  finalAmount     Int         @map("final_amount")
  recipientName   String      @map("recipient_name")
  recipientPhone  String      @map("recipient_phone")
  zipCode         String      @map("zip_code")
  address         String
  addressDetail   String?     @map("address_detail")
  memo            String?
  createdAt       DateTime    @default(now()) @map("created_at")
  updatedAt       DateTime    @updatedAt @map("updated_at")
  paidAt          DateTime?   @map("paid_at")

  user      User?       @relation(fields: [userId], references: [id], onDelete: SetNull)
  items     OrderItem[]
  refunds   Refund[]

  @@map("orders")
}

enum OrderStatus {
  PENDING_PAYMENT
  PAID
  PREPARING
  SHIPPED
  DELIVERED
  CANCELLED
  REFUNDED
}

model OrderItem {
  id              String   @id @default(cuid())
  orderId         String   @map("order_id")
  productId       String   @map("product_id")
  productVariantId String? @map("product_variant_id")
  quantity        Int
  price           Int      // 주문 시점 단가
  productSnapshot String?  @map("product_snapshot") @db.Text  // JSON: { name, optionLabel }

  order   Order          @relation(fields: [orderId], references: [id], onDelete: Cascade)
  product Product        @relation(fields: [productId], references: [id], onDelete: Restrict)
  variant ProductVariant? @relation(fields: [productVariantId], references: [id], onDelete: SetNull)
  review  Review?

  @@map("order_items")
}

model Refund {
  id          String   @id @default(cuid())
  orderId     String   @map("order_id")
  amount      Int
  reason      String?  @db.Text
  status      String   @default("PENDING")  // PENDING, COMPLETED, REJECTED
  createdAt   DateTime @default(now()) @map("created_at")
  processedAt DateTime? @map("processed_at")

  order Order @relation(fields: [orderId], references: [id], onDelete: Cascade)

  @@map("refunds")
}

// ========== 장바구니 ==========

model Cart {
  id         String   @id @default(cuid())
  userId     String?  @map("user_id")
  sessionId  String?  @unique @map("session_id")  // 비회원 시 쿠키/세션 ID
  createdAt  DateTime @default(now()) @map("created_at")
  updatedAt  DateTime @updatedAt @map("updated_at")

  user  User?      @relation(fields: [userId], references: [id], onDelete: Cascade)
  items CartItem[]
}

model CartItem {
  id              String   @id @default(cuid())
  cartId          String   @map("cart_id")
  productId       String   @map("product_id")
  productVariantId String? @map("product_variant_id")
  quantity        Int      @default(1)

  cart    Cart          @relation(fields: [cartId], references: [id], onDelete: Cascade)
  product Product       @relation(fields: [productId], references: [id], onDelete: Cascade)
  variant ProductVariant? @relation(fields: [productVariantId], references: [id], onDelete: SetNull)

  @@map("cart_items")
}

// ========== 마이페이지 ==========

model Pet {
  id        String   @id @default(cuid())
  userId    String   @map("user_id")
  name      String
  petType   PetType  @map("pet_type")
  breed     String?
  bodyType  String?  @map("body_type")  // 체형 (리뷰 연동용)
  birthDate DateTime? @map("birth_date")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Address {
  id            String   @id @default(cuid())
  userId        String   @map("user_id")
  label         String?
  recipientName String   @map("recipient_name")
  phone         String
  zipCode       String   @map("zip_code")
  address       String
  addressDetail String?  @map("address_detail")
  isDefault     Boolean  @default(false) @map("is_default")
  createdAt     DateTime @default(now()) @map("created_at")
  updatedAt     DateTime @updatedAt @map("updated_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model PointHistory {
  id        String   @id @default(cuid())
  userId    String   @map("user_id")
  amount    Int      // 양수: 적립, 음수: 사용
  reason    String
  orderId   String?  @map("order_id")
  createdAt DateTime @default(now()) @map("created_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

// ========== 리뷰·찜 ==========

model Review {
  id          String   @id @default(cuid())
  userId      String   @map("user_id")
  productId   String   @map("product_id")
  orderItemId String?  @unique @map("order_item_id")
  rating      Int
  content     String   @db.Text
  bodyType    String?  @map("body_type")  // 체형 (선택)
  imageUrls   String?  @map("image_urls") @db.Text  // JSON array
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  user      User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  product   Product    @relation(fields: [productId], references: [id], onDelete: Cascade)
  orderItem OrderItem? @relation(fields: [orderItemId], references: [id], onDelete: SetNull)
}

model Wishlist {
  id        String   @id @default(cuid())
  userId    String   @map("user_id")
  productId String   @map("product_id")
  createdAt DateTime @default(now()) @map("created_at")

  user    User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  product Product @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@unique([userId, productId])
  @@map("wishlists")
}

// ========== 쿠폰 ==========

model Coupon {
  id            String   @id @default(cuid())
  code         String   @unique
  type         CouponType  // PERCENT, FIXED
  value        Int         // 퍼센트 또는 원
  minOrderAmount Int?   @map("min_order_amount")
  startAt      DateTime @map("start_at")
  endAt        DateTime @map("end_at")
  usageLimit   Int?     @map("usage_limit")
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")

  userCoupons UserCoupon[]
}

enum CouponType {
  PERCENT
  FIXED
}

model UserCoupon {
  id        String    @id @default(cuid())
  userId    String    @map("user_id")
  couponId  String    @map("coupon_id")
  usedAt    DateTime? @map("used_at")
  orderId   String?   @map("order_id")
  createdAt DateTime  @default(now()) @map("created_at")

  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  coupon Coupon @relation(fields: [couponId], references: [id], onDelete: Cascade)

  @@unique([userId, couponId])
  @@map("user_coupons")
}

// ========== 입점업체 정산 ==========

model Settlement {
  id            String   @id @default(cuid())
  partnerId     String   @map("partner_id")
  periodStart   DateTime @map("period_start")
  periodEnd     DateTime @map("period_end")
  totalSales    Int      @map("total_sales")
  feeAmount     Int      @map("fee_amount")
  settlementAmount Int   @map("settlement_amount")
  status        String   @default("PENDING")  // PENDING, PAID
  paidAt        DateTime? @map("paid_at")
  createdAt     DateTime @default(now()) @map("created_at")

  partner Partner @relation(fields: [partnerId], references: [id], onDelete: Cascade)
}

// ========== 메인 큐레이션 ==========

model Curation {
  id        String   @id @default(cuid())
  type      CurationType @map("type")  // HERO_BANNER, CATEGORY, BEST_PRODUCT, REVIEW_HIGHLIGHT
  title     String?
  brand     Brand    @default(CAMI)   // CAMI, IVY, BOTH(전체 메인 공용 시 별도 처리)
  sortOrder Int      @default(0) @map("sort_order")
  isActive  Boolean  @default(true) @map("is_active")
  content   String?  @db.Text        // JSON: { productIds, imageUrl, link, ... }
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  items CurationItem[]
}

enum CurationType {
  HERO_BANNER
  CATEGORY
  BEST_PRODUCT
  REVIEW_HIGHLIGHT
}

model CurationItem {
  id          String   @id @default(cuid())
  curationId  String   @map("curation_id")
  productId   String?  @map("product_id")
  sortOrder   Int      @default(0) @map("sort_order")
  // 기타: 이미지 URL, 링크 등은 Curation.content JSON에 포함 가능

  curation Curation @relation(fields: [curationId], references: [id], onDelete: Cascade)
  product  Product? @relation(fields: [productId], references: [id], onDelete: SetNull)
}
```

---

## 4. 관계·인덱스 보완 (필요 시)

- **Order**: `userId` 인덱스, `orderNumber` 유니크, `status`, `createdAt` 검색용 인덱스
- **Product**: `partnerId`, `categoryId`, `brand`, `petType`, `approvalStatus` 복합 필터용
- **Cart**: `sessionId` 유니크(비회원), `userId`(회원)
- **Review**: `productId`, `userId` 목록 조회용

Prisma에서 `@@index([field])` 로 필요한 인덱스 추가 가능.

---

## 5. 포인트 잔액

`User` 테이블에 `totalPoints` 컬럼을 두거나, 매번 `PointHistory` 합계로 계산할 수 있다.  
MVP에서는 **계산으로 조회**해도 되고, 트래픽이 많으면 `User.totalPoints`를 두고 적립/사용 시 업데이트하는 방식 권장.

---

## 6. CartItem → Product 관계

위 스키마에서 `CartItem`이 `Product`를 직접 참조하도록 했으며, `ProductVariant`는 선택이다.  
옵션 없이 단일 상품만 판매할 경우 `productVariantId`는 null로 둔다.

---

이 스키마를 기준으로 `npx prisma migrate`로 마이그레이션 생성·적용 후, `prisma/seed.js`에서 더미 데이터를 넣으면 된다.
