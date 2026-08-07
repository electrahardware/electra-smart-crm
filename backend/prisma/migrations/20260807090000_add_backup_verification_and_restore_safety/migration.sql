ALTER TABLE "BackupJob"
  ADD COLUMN "verified" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "verificationAt" TIMESTAMP(3),
  ADD COLUMN "postgresVersion" TEXT,
  ADD COLUMN "tableCount" INTEGER,
  ADD COLUMN "databaseSize" BIGINT,
  ADD COLUMN "verificationError" TEXT;

ALTER TABLE "RestoreJob"
  ADD COLUMN "initiatedByUserId" INTEGER,
  ADD COLUMN "operatorIp" TEXT,
  ADD COLUMN "stage" TEXT NOT NULL DEFAULT 'Staging',
  ADD COLUMN "durationMs" INTEGER,
  ADD COLUMN "backupName" TEXT;

CREATE INDEX "BackupJob_verified_completedAt_idx" ON "BackupJob"("verified", "completedAt");
CREATE INDEX "RestoreJob_stage_status_createdAt_idx" ON "RestoreJob"("stage", "status", "createdAt");
