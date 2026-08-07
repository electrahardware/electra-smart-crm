import { Prisma } from "@prisma/client";
import { Request, Response } from "express";

import prisma from "../lib/prisma";
import { createAuditLog } from "../services/audit.service";
import {
  deleteDriveFile,
  getBackupSettings,
  isBackupOwner,
  makeIdempotencyKey,
  nextBackupAt,
  reportBackupFailure,
  safeBackupError,
  streamDriveFile,
  verifyDriveConnection,
} from "../services/backup.service";
import type { AuthRequest } from "../middleware/auth.middleware";

function serializeJob<T extends { fileSize?: bigint | null } | null>(job: T) {
  if (!job) return job;
  return { ...job, fileSize: job.fileSize?.toString() ?? null };
}

function owner(req: AuthRequest, res: Response) {
  if (isBackupOwner(req.user?.role)) return true;
  res.status(403).json({ message: "Only the Owner can manage database backups." });
  return false;
}

function restoreOwner(req: AuthRequest, res: Response) {
  if (req.user?.role === "Owner") return true;
  res.status(403).json({ message: "Only the Owner can run restore verification or production restore." });
  return false;
}

function requestIp(req: Request) {
  const forwarded = req.header("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || req.socket.remoteAddress || "unknown";
}

async function dispatchWorkflow(workflow: string, inputs: Record<string, string>) {
  const repository = process.env.BACKUP_GITHUB_REPOSITORY;
  const token = process.env.BACKUP_GITHUB_TOKEN;
  if (!repository || !token) throw new Error("GitHub backup dispatch configuration is unavailable.");
  const ref = process.env.GITHUB_BACKUP_REF ?? "main";
  const response = await fetch(`https://api.github.com/repos/${repository}/actions/workflows/${workflow}/dispatches`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ref, inputs }),
  });
  if (response.status === 204) return;
  const body = await response.text();
  throw new Error(`GitHub restore workflow dispatch failed (${response.status}): ${body || response.statusText}`);
}

function workflowAuthorized(req: Request) {
  const secret = process.env.BACKUP_WORKFLOW_SECRET;
  return Boolean(secret && req.header("x-backup-secret") === secret);
}

export async function getBackupOverview(req: AuthRequest, res: Response) {
  if (!owner(req, res)) return;
  try {
    const [settings, latest, running] = await Promise.all([
      getBackupSettings(),
      prisma.backupJob.findFirst({ where: { status: "Success" }, orderBy: { completedAt: "desc" } }),
      prisma.backupJob.findFirst({ where: { status: { in: ["Queued", "Running"] } }, orderBy: { createdAt: "desc" } }),
    ]);
    res.json({
      settings,
      latest: serializeJob(latest),
      activeJob: serializeJob(running),
      productionRestoreEnabled: false,
      productionRestoreConfigured: process.env.ENABLE_PRODUCTION_RESTORE === "true",
      driveConfigured: Boolean(process.env.GOOGLE_DRIVE_CLIENT_ID && process.env.GOOGLE_DRIVE_REFRESH_TOKEN && process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID),
    });
  } catch (error) {
    res.status(500).json({ message: safeBackupError(error) });
  }
}

export async function updateBackupSettings(req: AuthRequest, res: Response) {
  if (!owner(req, res)) return;
  try {
    const automaticEnabled = Boolean(req.body.automaticEnabled);
    const frequency = req.body.frequency === "Daily" ? "Daily" : "Daily";
    const backupTime = /^\d{2}:\d{2}$/.test(req.body.backupTime) ? req.body.backupTime : "02:00";
    const retentionCount = Math.min(90, Math.max(1, Number(req.body.retentionCount) || 30));
    const settings = await prisma.backupSettings.upsert({
      where: { id: 1 },
      create: { id: 1, automaticEnabled, frequency, backupTime, timezone: "Asia/Kolkata", retentionCount, retentionDays: retentionCount, nextBackupAt: nextBackupAt({ automaticEnabled, frequency, backupTime, timezone: "Asia/Kolkata" }) },
      update: { automaticEnabled, frequency, backupTime, retentionCount, retentionDays: retentionCount, nextBackupAt: nextBackupAt({ automaticEnabled, frequency, backupTime, timezone: "Asia/Kolkata" }) },
    });
    await createAuditLog({ module: "Backup", action: "Settings Updated", userId: req.user!.id, userName: req.user!.name, newValues: { automaticEnabled, frequency, backupTime, retentionCount } });
    res.json(settings);
  } catch (error) {
    res.status(400).json({ message: safeBackupError(error) });
  }
}

export async function listBackupJobs(req: AuthRequest, res: Response) {
  if (!owner(req, res)) return;
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
  const type = typeof req.query.type === "string" ? req.query.type : "";
  const status = typeof req.query.status === "string" ? req.query.status : "";
  const where: Prisma.BackupJobWhereInput = { ...(type ? { type } : {}), ...(status ? { status } : {}) };
  const [data, total] = await Promise.all([
    prisma.backupJob.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * limit, take: limit }),
    prisma.backupJob.count({ where }),
  ]);
  res.json({ data: data.map(serializeJob), total, page, limit });
}

export async function listRestoreJobs(req: AuthRequest, res: Response) {
  if (!restoreOwner(req, res)) return;
  const jobs = await prisma.restoreJob.findMany({
    include: { backupJob: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  res.json(jobs.map((job) => ({ ...job, backupJob: serializeJob(job.backupJob) })));
}

export async function requestStagingRestore(req: AuthRequest, res: Response) {
  if (!restoreOwner(req, res)) return;
  const backupJobId = String(req.body.backupJobId || "");
  try {
    const backup = await prisma.backupJob.findUnique({ where: { id: backupJobId } });
    if (!backup || backup.status !== "Success" || !backup.verified || !backup.storageFileId) {
      return res.status(409).json({ message: "Only a successfully verified backup can be restored to staging." });
    }
    const active = await prisma.restoreJob.findFirst({ where: { status: { in: ["Queued", "Running"] } } });
    if (active) return res.status(409).json({ message: "A restore verification is already running." });
    const restore = await prisma.restoreJob.create({
      data: { backupJobId: backup.id, backupName: backup.fileName, status: "Queued", stage: "Staging", initiatedBy: req.user!.name, initiatedByUserId: req.user!.id, operatorIp: requestIp(req) },
    });
    await dispatchWorkflow("restore.yml", { restore_job_id: restore.id, mode: "staging" });
    await createAuditLog({ module: "Backup", action: "Restore Started", userId: req.user!.id, userName: req.user!.name, entityName: backup.fileName ?? backup.id, ipAddress: requestIp(req), newValues: { stage: "Staging", restoreJobId: restore.id } });
    res.status(202).json(restore);
  } catch (error) {
    await reportBackupFailure("staging_restore_dispatch", error, backupJobId || undefined);
    res.status(500).json({ message: safeBackupError(error) });
  }
}

export async function confirmProductionRestore(req: AuthRequest, res: Response) {
  if (!restoreOwner(req, res)) return;
  const restoreJobId = String(req.params.id || "");
  if (req.body.confirmation !== "RESTORE") return res.status(400).json({ message: 'Type RESTORE exactly to enable production restore.' });
  if (process.env.ENABLE_PRODUCTION_RESTORE !== "true") return res.status(403).json({ message: "Production restore is disabled by deployment policy." });
  try {
    const staging = await prisma.restoreJob.findUnique({ include: { backupJob: true }, where: { id: restoreJobId } });
    if (!staging || staging.stage !== "Staging" || staging.status !== "Success") return res.status(409).json({ message: "A successful staging restore is required before production restore." });
    const verification = staging.verificationResult as { passed?: boolean } | null;
    if (!verification?.passed) return res.status(409).json({ message: "Staging integrity verification did not pass." });
    const production = await prisma.restoreJob.create({ data: { backupJobId: staging.backupJobId, backupName: staging.backupName, status: "Queued", stage: "Production", initiatedBy: req.user!.name, initiatedByUserId: req.user!.id, operatorIp: requestIp(req) } });
    await dispatchWorkflow("restore.yml", { restore_job_id: production.id, mode: "production" });
    await createAuditLog({ module: "Backup", action: "Restore Started", userId: req.user!.id, userName: req.user!.name, entityName: staging.backupName ?? staging.backupJobId, ipAddress: requestIp(req), newValues: { stage: "Production", restoreJobId: production.id } });
    res.status(202).json(production);
  } catch (error) {
    await reportBackupFailure("production_restore_dispatch", error);
    res.status(500).json({ message: safeBackupError(error) });
  }
}

export async function requestManualBackup(req: AuthRequest, res: Response) {
  if (!owner(req, res)) return;
  let jobId: string | undefined;
  try {
    if (!process.env.BACKUP_GITHUB_TOKEN || !process.env.BACKUP_GITHUB_REPOSITORY) {
      return res.status(503).json({ message: "Manual backup is unavailable until GitHub Actions secrets are configured." });
    }
    const active = await prisma.backupJob.findFirst({ where: { status: { in: ["Queued", "Running"] } } });
    if (active) return res.status(409).json({ message: "A backup is already running.", job: active });
    const job = await prisma.backupJob.create({ data: { type: "Manual", status: "Queued", createdBy: req.user!.name } });
    jobId = job.id;
    const repository = process.env.BACKUP_GITHUB_REPOSITORY;
    const workflow = process.env.GITHUB_BACKUP_WORKFLOW ?? "backup.yml";
    const ref = process.env.GITHUB_BACKUP_REF ?? "main";
    const githubUrl = `https://api.github.com/repos/${repository}/actions/workflows/${workflow}/dispatches`;
    const requestBody = { ref, inputs: { backup_type: "Manual", job_id: job.id } };

    console.info("[backup:manual-dispatch] GitHub workflow dispatch request", {
      githubUrl,
      repository,
      workflow,
      ref,
      authorization: "Bearer [redacted]",
      accept: "application/vnd.github+json",
      githubApiVersion: "2022-11-28",
      jobId: job.id,
    });

    const response = await fetch(githubUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.BACKUP_GITHUB_TOKEN}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const rawGitHubBody = await response.text();
    let githubBody: unknown = rawGitHubBody;
    try { githubBody = rawGitHubBody ? JSON.parse(rawGitHubBody) : null; } catch { /* GitHub may return non-JSON error text. */ }

    console.info("[backup:manual-dispatch] GitHub workflow dispatch response", {
      status: response.status,
      statusText: response.statusText,
      body: githubBody,
      jobId: job.id,
    });

    if (!response.ok) {
      const githubMessage = typeof githubBody === "object" && githubBody && "message" in githubBody
        ? String((githubBody as { message?: unknown }).message)
        : rawGitHubBody || `GitHub workflow dispatch failed with HTTP ${response.status}.`;
      await prisma.backupJob.update({ where: { id: job.id }, data: { status: "Failed", errorStage: "workflow_dispatch", errorMessage: `GitHub HTTP ${response.status}: ${githubMessage}`.slice(0, 500) } });
      await reportBackupFailure("workflow_dispatch", new Error(`GitHub HTTP ${response.status}: ${githubMessage}`), job.id);
      return res.status(response.status).json({
        message: githubMessage,
        status: response.status,
        github_message: githubMessage,
        github_response: githubBody,
      });
    }
    await createAuditLog({ module: "Backup", action: "Manual Backup Requested", userId: req.user!.id, userName: req.user!.name, entityName: job.id });
    res.status(202).json(job);
  } catch (error) {
    console.error("[backup:manual-dispatch] GitHub request failed before a response", {
      message: error instanceof Error ? error.message : "Unknown error",
      name: error instanceof Error ? error.name : undefined,
      jobId,
    });
    if (jobId) {
      await prisma.backupJob.update({
        where: { id: jobId },
        data: { status: "Failed", errorStage: "workflow_dispatch_request", errorMessage: safeBackupError(error) },
      }).catch(() => undefined);
    }
    await reportBackupFailure("manual_dispatch", error);
    res.status(502).json({
      message: "GitHub dispatch request failed before GitHub returned a response.",
      github_message: safeBackupError(error),
    });
  }
}

export async function downloadBackup(req: AuthRequest, res: Response) {
  if (!owner(req, res)) return;
  const jobId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  try {
    const job = await prisma.backupJob.findUnique({ where: { id: jobId } });
    if (!job || job.status !== "Success" || !job.storageFileId) return res.status(404).json({ message: "Backup file not found." });
    res.setHeader("Content-Disposition", `attachment; filename="${job.fileName ?? "electra-crm-backup.enc"}"`);
    await streamDriveFile(job.storageFileId, res);
  } catch (error) {
    await reportBackupFailure("download", error, jobId);
    if (!res.headersSent) res.status(500).json({ message: safeBackupError(error) });
  }
}

export async function deleteBackup(req: AuthRequest, res: Response) {
  if (!owner(req, res)) return;
  const jobId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  try {
    const settings = await getBackupSettings();
    const job = await prisma.backupJob.findUnique({ where: { id: jobId } });
    if (!job || job.status !== "Success" || !job.storageFileId) return res.status(404).json({ message: "Backup not found." });
    if (settings.latestBackupJobId === job.id) return res.status(409).json({ message: "The current Latest Backup cannot be deleted. Create another verified backup first." });
    await deleteDriveFile(job.storageFileId);
    await prisma.backupJob.delete({ where: { id: job.id } });
    await createAuditLog({ module: "Backup", action: "Backup Deleted", userId: req.user!.id, userName: req.user!.name, entityName: job.fileName ?? job.id });
    res.status(204).end();
  } catch (error) {
    await reportBackupFailure("delete", error, jobId);
    res.status(500).json({ message: safeBackupError(error) });
  }
}

export async function testDrive(req: AuthRequest, res: Response) {
  if (!owner(req, res)) return;
  try {
    await verifyDriveConnection();
    res.json({ connected: true });
  } catch (error) {
    await reportBackupFailure("drive_connection", error);
    res.status(503).json({ connected: false, message: safeBackupError(error) });
  }
}

export async function workflowStart(req: Request, res: Response) {
  if (!workflowAuthorized(req)) return res.status(401).json({ message: "Unauthorized backup workflow." });
  try {
    const type = req.body.type === "Manual" ? "Manual" : "Automatic";
    const settings = await getBackupSettings();
    if (type === "Automatic" && !settings.automaticEnabled) return res.json({ shouldRun: false, reason: "Automatic backups are disabled.", retentionCount: settings.retentionCount });
    const idempotencyKey = type === "Automatic" ? String(req.body.idempotencyKey || makeIdempotencyKey()) : undefined;
    let job = req.body.jobId ? await prisma.backupJob.findUnique({ where: { id: String(req.body.jobId) } }) : null;
    if (job?.status === "Success") return res.json({ shouldRun: false, jobId: job.id, reason: "Backup already completed.", retentionCount: settings.retentionCount });
    if (!job && idempotencyKey) {
      job = await prisma.backupJob.findUnique({ where: { idempotencyKey } });
      if (job?.status === "Success" || job?.status === "Running") return res.json({ shouldRun: false, jobId: job.id, reason: "Scheduled backup already exists.", retentionCount: settings.retentionCount });
    }
    if (!job) job = await prisma.backupJob.create({ data: { type, status: "Queued", idempotencyKey, createdBy: "GitHub Actions" } });
    job = await prisma.backupJob.update({ where: { id: job.id }, data: { status: "Running", startedAt: new Date(), errorStage: null, errorMessage: null, retryCount: { increment: 1 } } });
    res.json({ shouldRun: true, jobId: job.id, retentionCount: settings.retentionCount });
  } catch (error) {
    res.status(500).json({ message: safeBackupError(error) });
  }
}

export async function workflowReport(req: Request, res: Response) {
  const authPassed = workflowAuthorized(req);
  console.info("[backup:workflow-report] authentication", { authPassed, hasConfiguredSecret: Boolean(process.env.BACKUP_WORKFLOW_SECRET), hasRequestSecret: Boolean(req.header("x-backup-secret")) });
  if (!authPassed) return res.status(401).json({ message: "Unauthorized backup workflow." });
  const jobId = String(req.body.jobId || "");
  console.info("[backup:workflow-report] received payload", {
    jobId: jobId || null,
    status: req.body.status ?? null,
    verified: req.body.verified ?? null,
    verificationAt: req.body.verificationAt ?? null,
    hasChecksum: Boolean(req.body.checksum),
    postgresVersion: req.body.postgresVersion ?? null,
    tableCount: req.body.tableCount ?? null,
    databaseSize: req.body.databaseSize ?? null,
    hasStorageFileId: Boolean(req.body.storageFileId),
  });
  if (!jobId) return res.status(400).json({ message: "jobId is required." });
  try {
    const verificationPassed = req.body.verified === true || req.body.verified === "true";
    const succeeded = req.body.status === "Success" && verificationPassed;
    const job = await prisma.$transaction(async (tx) => {
      const existing = await tx.backupJob.findUnique({ where: { id: jobId }, select: { id: true, status: true } });
      console.info("[backup:workflow-report] job lookup", { jobId, found: Boolean(existing), previousStatus: existing?.status ?? null });
      if (!existing) throw new Error(`Backup job ${jobId} was not found.`);
      const updated = await tx.backupJob.update({
        where: { id: jobId },
        data: {
          status: succeeded ? "Success" : req.body.status === "Success" ? "Verification Failed" : "Failed",
          completedAt: new Date(),
          durationMs: Number(req.body.durationMs) || undefined,
          fileName: succeeded ? String(req.body.fileName || "") : undefined,
          fileSize: succeeded && req.body.fileSize ? BigInt(req.body.fileSize) : undefined,
          format: succeeded ? "pg_dump custom + AES-256-GCM" : undefined,
          checksum: succeeded ? String(req.body.checksum || "") : undefined,
          verified: verificationPassed,
          verificationAt: req.body.verificationAt ? new Date(String(req.body.verificationAt)) : new Date(),
          verificationStatus: verificationPassed ? "Verified" : "Failed",
          postgresVersion: req.body.postgresVersion ? String(req.body.postgresVersion) : undefined,
          tableCount: Number.isFinite(Number(req.body.tableCount)) ? Number(req.body.tableCount) : undefined,
          databaseSize: req.body.databaseSize ? BigInt(req.body.databaseSize) : undefined,
          verificationError: verificationPassed ? null : String(req.body.verificationError || req.body.errorMessage || "Backup integrity verification failed.").slice(0, 500),
          storageFileId: succeeded ? String(req.body.storageFileId || "") : undefined,
          storagePath: succeeded ? String(req.body.storagePath || "") : undefined,
          errorStage: succeeded ? null : String(req.body.errorStage || "workflow"),
          errorMessage: succeeded ? null : String(req.body.errorMessage || "Backup workflow failed.").slice(0, 500),
        },
      });
      if (succeeded) await tx.backupSettings.upsert({ where: { id: 1 }, create: { id: 1, lastBackupAt: new Date(), latestBackupJobId: updated.id }, update: { lastBackupAt: new Date(), latestBackupJobId: updated.id } });
      return updated;
    });
    console.info("[backup:workflow-report] transaction committed", { jobId: job.id, status: job.status, verified: job.verified, verificationStatus: job.verificationStatus, checksumPersisted: Boolean(job.checksum), tableCount: job.tableCount, databaseSize: job.databaseSize?.toString() ?? null });
    if (succeeded) {
      await createAuditLog({ module: "Backup", action: "Backup Created", userName: "GitHub Actions", entityName: job.fileName ?? job.id, newValues: { verified: true, checksum: job.checksum } });
    } else {
      await reportBackupFailure(String(req.body.errorStage || "workflow"), String(req.body.errorMessage || "Backup workflow failed."), job.id);
    }
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ message: safeBackupError(error) });
  }
}

export async function restoreWorkflowStart(req: Request, res: Response) {
  if (!workflowAuthorized(req)) return res.status(401).json({ message: "Unauthorized restore workflow." });
  const restoreJobId = String(req.body.restoreJobId || "");
  const mode = req.body.mode === "production" ? "Production" : "Staging";
  const restore = await prisma.restoreJob.findUnique({ include: { backupJob: true }, where: { id: restoreJobId } });
  if (!restore || restore.stage !== mode || restore.status !== "Queued") return res.status(409).json({ message: "Restore job is not eligible to start." });
  if (!restore.backupJob.verified || restore.backupJob.status !== "Success" || !restore.backupJob.storageFileId) return res.status(409).json({ message: "Backup integrity verification is required." });
  if (mode === "Production" && process.env.ENABLE_PRODUCTION_RESTORE !== "true") return res.status(403).json({ message: "Production restore is disabled by deployment policy." });
  await prisma.restoreJob.update({ where: { id: restore.id }, data: { status: "Running", startedAt: new Date() } });
  res.json({ ok: true, backup: { storageFileId: restore.backupJob.storageFileId, fileName: restore.backupJob.fileName, checksum: restore.backupJob.checksum }, stage: mode });
}

export async function restoreWorkflowReport(req: Request, res: Response) {
  if (!workflowAuthorized(req)) return res.status(401).json({ message: "Unauthorized restore workflow." });
  const restoreJobId = String(req.body.restoreJobId || "");
  const passed = req.body.status === "Success" && req.body.verification?.passed === true;
  try {
    const restore = await prisma.restoreJob.update({
      where: { id: restoreJobId },
      data: { status: passed ? "Success" : "Failed", completedAt: new Date(), durationMs: Number(req.body.durationMs) || undefined, verificationResult: req.body.verification ?? null, errorMessage: passed ? null : String(req.body.errorMessage || "Restore verification failed.").slice(0, 500) },
    });
    await createAuditLog({ module: "Backup", action: passed ? "Restore Completed" : "Restore Failed", userName: restore.initiatedBy ?? "GitHub Actions", entityName: restore.backupName ?? restore.backupJobId, ipAddress: restore.operatorIp ?? undefined, newValues: { stage: restore.stage, restoreJobId: restore.id, verification: req.body.verification ?? null } });
    if (!passed) await reportBackupFailure("restore_verification", new Error(restore.errorMessage ?? "Restore verification failed."), restore.backupJobId);
    res.json({ ok: true });
  } catch (error) { res.status(500).json({ message: safeBackupError(error) }); }
}
