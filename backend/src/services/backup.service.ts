import crypto from "crypto";
import { Readable } from "stream";
import * as Sentry from "@sentry/node";

import prisma from "../lib/prisma";

const OWNER_ROLES = ["Owner", "Admin"];
const DRIVE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const DRIVE_FILES_URL = "https://www.googleapis.com/drive/v3/files";

export function isBackupOwner(role?: string) {
  return OWNER_ROLES.includes(role ?? "");
}

export function nextBackupAt(settings: {
  automaticEnabled: boolean;
  frequency: string;
  backupTime: string;
  timezone: string;
}) {
  if (!settings.automaticEnabled) return null;

  const [hour = "02", minute = "00"] = settings.backupTime.split(":");
  // The installation is intentionally fixed to Asia/Kolkata until multi-timezone scheduling is added.
  const now = new Date();
  const ist = new Date(now.toLocaleString("en-US", { timeZone: settings.timezone || "Asia/Kolkata" }));
  ist.setHours(Number(hour), Number(minute), 0, 0);
  if (ist <= new Date(now.toLocaleString("en-US", { timeZone: settings.timezone || "Asia/Kolkata" }))) {
    ist.setDate(ist.getDate() + 1);
  }
  const utcOffsetMs = 5.5 * 60 * 60 * 1000;
  return new Date(ist.getTime() - utcOffsetMs);
}

export async function getBackupSettings() {
  const existing = await prisma.backupSettings.findUnique({ where: { id: 1 } });
  if (existing) return existing;

  const settings = await prisma.backupSettings.create({
    data: {
      id: 1,
      nextBackupAt: nextBackupAt({
        automaticEnabled: true,
        frequency: "Daily",
        backupTime: "02:00",
        timezone: "Asia/Kolkata",
      }),
    },
  });
  return settings;
}

export async function getGoogleDriveAccessToken() {
  const clientId = process.env.GOOGLE_DRIVE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_DRIVE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_DRIVE_REFRESH_TOKEN;
  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error("Google Drive backup credentials are not configured.");
  }

  const response = await fetch(DRIVE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });
  if (!response.ok) throw new Error("Google Drive authentication failed.");
  const data = (await response.json()) as { access_token?: string };
  if (!data.access_token) throw new Error("Google Drive did not return an access token.");
  return data.access_token;
}

export async function verifyDriveConnection() {
  const token = await getGoogleDriveAccessToken();
  const folderId = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID;
  const url = folderId ? `${DRIVE_FILES_URL}/${encodeURIComponent(folderId)}?fields=id,name,mimeType` : `${DRIVE_FILES_URL}?pageSize=1`;
  const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!response.ok) throw new Error("Unable to reach the configured Google Drive backup folder.");
  return true;
}

export async function deleteDriveFile(fileId: string) {
  const token = await getGoogleDriveAccessToken();
  const response = await fetch(`${DRIVE_FILES_URL}/${encodeURIComponent(fileId)}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok && response.status !== 404) throw new Error("Google Drive file deletion failed.");
}

export async function streamDriveFile(fileId: string, res: import("express").Response) {
  const token = await getGoogleDriveAccessToken();
  const response = await fetch(`${DRIVE_FILES_URL}/${encodeURIComponent(fileId)}?alt=media`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok || !response.body) throw new Error("The encrypted backup file is unavailable in Google Drive.");
  res.setHeader("Content-Type", "application/octet-stream");
  res.setHeader("Content-Disposition", "attachment");
  Readable.fromWeb(response.body as import("stream/web").ReadableStream).pipe(res);
}

export function safeBackupError(error: unknown) {
  const message = error instanceof Error ? error.message : "Backup operation failed.";
  return message.replace(/postgres(?:ql)?:\/\/[^\s]+/gi, "[redacted database URL]").slice(0, 500);
}

export async function reportBackupFailure(stage: string, error: unknown, jobId?: string) {
  const safeMessage = safeBackupError(error);
  console.error(`[backup:${stage}]`, safeMessage, jobId ? { jobId } : "");
  if (process.env.SENTRY_DSN) {
    Sentry.withScope((scope) => {
      scope.setTag("feature", "database_backup");
      scope.setTag("stage", stage);
      if (jobId) scope.setTag("job_id", jobId);
      scope.setExtra("safe_message", safeMessage);
      Sentry.captureException(new Error(safeMessage));
    });
  }
}

export function makeIdempotencyKey() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const get = (name: string) => parts.find((part) => part.type === name)?.value ?? "00";
  return `automatic-${get("year")}-${get("month")}-${get("day")}-0200-asia-kolkata`;
}

export function checksum(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex");
}
