-- CreateTable
CREATE TABLE "Lead" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "customerName" TEXT NOT NULL,
    "mobile" TEXT NOT NULL,
    "whatsapp" TEXT,
    "shopName" TEXT,
    "customerType" TEXT,
    "email" TEXT,
    "gst" TEXT,
    "country" TEXT,
    "state" TEXT,
    "district" TEXT,
    "area" TEXT,
    "pincode" TEXT,
    "addressLine1" TEXT,
    "addressLine2" TEXT,
    "leadOwner" TEXT,
    "leadSource" TEXT,
    "language" TEXT,
    "priority" TEXT,
    "status" TEXT,
    "expectedValue" REAL,
    "probability" INTEGER,
    "products" TEXT,
    "followupDate" DATETIME,
    "followupTime" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Lead_mobile_key" ON "Lead"("mobile");
