CREATE TABLE "BackupSettings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "automaticEnabled" BOOLEAN NOT NULL DEFAULT true,
    "frequency" TEXT NOT NULL DEFAULT 'Daily',
    "backupTime" TEXT NOT NULL DEFAULT '02:00',
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Kolkata',
    "retentionDays" INTEGER NOT NULL DEFAULT 30,
    "retentionCount" INTEGER NOT NULL DEFAULT 30,
    "googleDriveRootFolderId" TEXT,
    "lastBackupAt" TIMESTAMP(3),
    "nextBackupAt" TIMESTAMP(3),
    "latestBackupJobId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "BackupSettings_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BackupJob" (
    "id" TEXT NOT NULL,
    "idempotencyKey" TEXT,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Queued',
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "durationMs" INTEGER,
    "fileName" TEXT,
    "fileSize" BIGINT,
    "format" TEXT,
    "checksum" TEXT,
    "storageProvider" TEXT DEFAULT 'Google Drive',
    "storageFileId" TEXT,
    "storagePath" TEXT,
    "createdBy" TEXT,
    "errorStage" TEXT,
    "errorMessage" TEXT,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "BackupJob_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "RestoreJob" (
    "id" TEXT NOT NULL,
    "backupJobId" TEXT NOT NULL,
    "snapshotBackupId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Blocked',
    "initiatedBy" TEXT,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "verificationResult" JSONB,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "RestoreJob_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "BackupJob_idempotencyKey_key" ON "BackupJob"("idempotencyKey");
CREATE INDEX "BackupJob_status_createdAt_idx" ON "BackupJob"("status", "createdAt");
CREATE INDEX "BackupJob_type_createdAt_idx" ON "BackupJob"("type", "createdAt");
CREATE INDEX "RestoreJob_status_createdAt_idx" ON "RestoreJob"("status", "createdAt");
ALTER TABLE "RestoreJob" ADD CONSTRAINT "RestoreJob_backupJobId_fkey" FOREIGN KEY ("backupJobId") REFERENCES "BackupJob"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
