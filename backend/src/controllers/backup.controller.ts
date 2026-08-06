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

export async function requestManualBackup(req: AuthRequest, res: Response) {
  if (!owner(req, res)) return;
  try {
    if (!process.env.GITHUB_BACKUP_TOKEN || !process.env.GITHUB_REPOSITORY) {
      return res.status(503).json({ message: "Manual backup is unavailable until GitHub Actions secrets are configured." });
    }
    const active = await prisma.backupJob.findFirst({ where: { status: { in: ["Queued", "Running"] } } });
    if (active) return res.status(409).json({ message: "A backup is already running.", job: active });
    const job = await prisma.backupJob.create({ data: { type: "Manual", status: "Queued", createdBy: req.user!.name } });
    const repository = process.env.GITHUB_REPOSITORY;
    const workflow = process.env.GITHUB_BACKUP_WORKFLOW ?? "backup.yml";
    const response = await fetch(`https://api.github.com/repos/${repository}/actions/workflows/${workflow}/dispatches`, {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.GITHUB_BACKUP_TOKEN}`, Accept: "application/vnd.github+json", "Content-Type": "application/json" },
      body: JSON.stringify({ ref: process.env.GITHUB_BACKUP_REF ?? "main", inputs: { backup_type: "manual", job_id: job.id } }),
    });
    if (!response.ok) {
      await prisma.backupJob.update({ where: { id: job.id }, data: { status: "Failed", errorStage: "workflow_dispatch", errorMessage: "GitHub Actions could not be started." } });
      throw new Error("GitHub Actions could not be started.");
    }
    await createAuditLog({ module: "Backup", action: "Manual Backup Requested", userId: req.user!.id, userName: req.user!.name, entityName: job.id });
    res.status(202).json(job);
  } catch (error) {
    await reportBackupFailure("manual_dispatch", error);
    res.status(500).json({ message: safeBackupError(error) });
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
  if (!workflowAuthorized(req)) return res.status(401).json({ message: "Unauthorized backup workflow." });
  const jobId = String(req.body.jobId || "");
  if (!jobId) return res.status(400).json({ message: "jobId is required." });
  try {
    const succeeded = req.body.status === "Success";
    const job = await prisma.backupJob.update({
      where: { id: jobId },
      data: {
        status: succeeded ? "Success" : "Failed",
        completedAt: new Date(),
        durationMs: Number(req.body.durationMs) || undefined,
        fileName: succeeded ? String(req.body.fileName || "") : undefined,
        fileSize: succeeded && req.body.fileSize ? BigInt(req.body.fileSize) : undefined,
        format: succeeded ? "pg_dump custom + AES-256-GCM" : undefined,
        checksum: succeeded ? String(req.body.checksum || "") : undefined,
        storageFileId: succeeded ? String(req.body.storageFileId || "") : undefined,
        storagePath: succeeded ? String(req.body.storagePath || "") : undefined,
        errorStage: succeeded ? null : String(req.body.errorStage || "workflow"),
        errorMessage: succeeded ? null : String(req.body.errorMessage || "Backup workflow failed.").slice(0, 500),
      },
    });
    if (succeeded) {
      await prisma.backupSettings.upsert({ where: { id: 1 }, create: { id: 1, lastBackupAt: new Date(), latestBackupJobId: job.id }, update: { lastBackupAt: new Date(), latestBackupJobId: job.id } });
    } else {
      await reportBackupFailure(String(req.body.errorStage || "workflow"), String(req.body.errorMessage || "Backup workflow failed."), job.id);
    }
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ message: safeBackupError(error) });
  }
}
