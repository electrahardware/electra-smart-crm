-- AI Daily Leads: daily immutable batch snapshots and database-driven scoring rules.
CREATE TABLE "AiDailyLeadSettings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "batchSize" INTEGER NOT NULL DEFAULT 100,
    "generationHour" INTEGER NOT NULL DEFAULT 2,
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Kolkata',
    "lastGeneratedFor" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "AiDailyLeadSettings_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AiDailyLeadScoringRule" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "weight" INTEGER NOT NULL DEFAULT 0,
    "action" TEXT NOT NULL DEFAULT 'SCORE',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "AiDailyLeadScoringRule_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AiDailyLeadBatch" (
    "id" TEXT NOT NULL,
    "batchDate" TIMESTAMP(3) NOT NULL,
    "salesExecutiveId" INTEGER NOT NULL,
    "salesExecutiveName" TEXT NOT NULL,
    "batchSize" INTEGER NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "archivedAt" TIMESTAMP(3),
    "archiveStatus" TEXT NOT NULL DEFAULT 'Active',
    "regenerationCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "AiDailyLeadBatch_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AiDailyLeadBatchItem" (
    "id" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "leadId" INTEGER NOT NULL,
    "aiScore" INTEGER NOT NULL,
    "aiReason" TEXT NOT NULL,
    "reasonCategory" TEXT NOT NULL,
    "lastNote" TEXT,
    "lastFollowupAt" TIMESTAMP(3),
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "AiDailyLeadBatchItem_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AiDailyLeadScoringRule_key_key" ON "AiDailyLeadScoringRule"("key");
CREATE UNIQUE INDEX "AiDailyLeadBatch_batchDate_salesExecutiveId_key" ON "AiDailyLeadBatch"("batchDate", "salesExecutiveId");
CREATE UNIQUE INDEX "AiDailyLeadBatchItem_batchId_leadId_key" ON "AiDailyLeadBatchItem"("batchId", "leadId");
CREATE INDEX "AiDailyLeadScoringRule_isActive_idx" ON "AiDailyLeadScoringRule"("isActive");
CREATE INDEX "AiDailyLeadBatch_salesExecutiveId_batchDate_idx" ON "AiDailyLeadBatch"("salesExecutiveId", "batchDate");
CREATE INDEX "AiDailyLeadBatch_archiveStatus_batchDate_idx" ON "AiDailyLeadBatch"("archiveStatus", "batchDate");
CREATE INDEX "AiDailyLeadBatchItem_batchId_completedAt_aiScore_idx" ON "AiDailyLeadBatchItem"("batchId", "completedAt", "aiScore");
CREATE INDEX "AiDailyLeadBatchItem_leadId_idx" ON "AiDailyLeadBatchItem"("leadId");

ALTER TABLE "AiDailyLeadBatch" ADD CONSTRAINT "AiDailyLeadBatch_salesExecutiveId_fkey"
  FOREIGN KEY ("salesExecutiveId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AiDailyLeadBatchItem" ADD CONSTRAINT "AiDailyLeadBatchItem_batchId_fkey"
  FOREIGN KEY ("batchId") REFERENCES "AiDailyLeadBatch"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AiDailyLeadBatchItem" ADD CONSTRAINT "AiDailyLeadBatchItem_leadId_fkey"
  FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;
