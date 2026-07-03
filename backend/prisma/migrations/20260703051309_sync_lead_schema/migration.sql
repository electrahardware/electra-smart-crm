/*
  Warnings:

  - You are about to alter the column `products` on the `Lead` table. The data in that column could be lost. The data in that column will be cast from `String` to `Json`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Lead" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "customerName" TEXT NOT NULL,
    "mobile" TEXT NOT NULL,
    "secondaryMobile" TEXT,
    "whatsapp" TEXT,
    "shopName" TEXT,
    "customerType" TEXT,
    "email" TEXT,
    "gst" TEXT,
    "country" TEXT DEFAULT 'India',
    "state" TEXT,
    "district" TEXT,
    "area" TEXT,
    "pincode" TEXT,
    "addressLine1" TEXT,
    "addressLine2" TEXT,
    "website" TEXT,
    "leadOwner" TEXT,
    "leadSource" TEXT,
    "language" TEXT,
    "priority" TEXT,
    "status" TEXT,
    "expectedValue" REAL,
    "probability" INTEGER,
    "products" JSONB,
    "followupDate" DATETIME,
    "followupTime" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Lead" ("addressLine1", "addressLine2", "area", "country", "createdAt", "customerName", "customerType", "district", "email", "expectedValue", "followupDate", "followupTime", "gst", "id", "language", "leadOwner", "leadSource", "mobile", "notes", "pincode", "priority", "probability", "products", "shopName", "state", "status", "updatedAt", "whatsapp") SELECT "addressLine1", "addressLine2", "area", "country", "createdAt", "customerName", "customerType", "district", "email", "expectedValue", "followupDate", "followupTime", "gst", "id", "language", "leadOwner", "leadSource", "mobile", "notes", "pincode", "priority", "probability", "products", "shopName", "state", "status", "updatedAt", "whatsapp" FROM "Lead";
DROP TABLE "Lead";
ALTER TABLE "new_Lead" RENAME TO "Lead";
CREATE UNIQUE INDEX "Lead_mobile_key" ON "Lead"("mobile");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
