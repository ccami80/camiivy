/*
  Warnings:

  - You are about to drop the column `shipping_info` on the `products` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_products" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "partner_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "model_name" TEXT,
    "brand" TEXT NOT NULL,
    "pet_type" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "base_price" INTEGER NOT NULL,
    "total_stock" INTEGER NOT NULL DEFAULT 0,
    "description" TEXT,
    "detail_content" TEXT,
    "detail_template_type" TEXT,
    "shipping_method" TEXT,
    "shipping_period" TEXT,
    "shipping_note" TEXT,
    "shipping_fee" INTEGER,
    "manufacturer" TEXT,
    "country_of_origin" TEXT,
    "return_address" TEXT,
    "size_option" TEXT,
    "color_option" TEXT,
    "approval_status" TEXT NOT NULL DEFAULT 'PENDING',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "products_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "products_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "partners" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_products" ("approval_status", "base_price", "brand", "category_id", "color_option", "country_of_origin", "created_at", "description", "detail_content", "detail_template_type", "id", "manufacturer", "model_name", "name", "partner_id", "pet_type", "return_address", "shipping_fee", "size_option", "total_stock", "updated_at") SELECT "approval_status", "base_price", "brand", "category_id", "color_option", "country_of_origin", "created_at", "description", "detail_content", "detail_template_type", "id", "manufacturer", "model_name", "name", "partner_id", "pet_type", "return_address", "shipping_fee", "size_option", "total_stock", "updated_at" FROM "products";
DROP TABLE "products";
ALTER TABLE "new_products" RENAME TO "products";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
