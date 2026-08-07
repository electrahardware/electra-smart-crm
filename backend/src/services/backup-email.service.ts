import * as Sentry from "@sentry/node";

import prisma from "../lib/prisma";
import { createAuditLog } from "./audit.service";

type BackupEmail = {
  subject: string;
  title: string;
  lines: Array<[string, string]>;
  tone: "success" | "danger" | "info";
};

const COLORS = {
  success: "#15803d",
  danger: "#b91c1c",
  info: "#1d4ed8",
} as const;

function recipients() {
  return (process.env.BACKUP_REPORT_RECIPIENTS ?? "")
    .split(",")
    .map((email) => email.trim())
    .filter(Boolean);
}

function escapeHtml(value: string) {
  return value.replace(/[&<>'\"]/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    "\"": "&quot;",
  })[character] ?? character);
}

function formatBytes(value?: bigint | number | null) {
  if (value === null || value === undefined) return "Not available";
  const bytes = Number(value);
  if (!Number.isFinite(bytes)) return "Not available";
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function formatDuration(value?: number | null) {
  if (!value) return "Not available";
  return `${(value / 1000).toFixed(value >= 10_000 ? 0 : 1)} seconds`;
}

async function sendBackupEmail(email: BackupEmail) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  const to = recipients();

  if (!apiKey || !from || to.length === 0) {
    console.warn("[backup-email] notification skipped: Resend email configuration is incomplete.");
    return false;
  }

  const rows = email.lines
    .map(([label, value]) => `<tr><td style="padding:8px 12px;color:#64748b;border-bottom:1px solid #e5e7eb">${escapeHtml(label)}</td><td style="padding:8px 12px;color:#1e293b;border-bottom:1px solid #e5e7eb">${escapeHtml(value)}</td></tr>`)
    .join("");
  const html = `<div style="font-family:Arial,sans-serif;background:#f8fafc;padding:24px"><div style="max-width:620px;margin:auto;background:#fff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden"><div style="padding:20px 24px;background:${COLORS[email.tone]};color:#fff"><strong>Electra Smart CRM</strong><br/><span>${escapeHtml(email.title)}</span></div><div style="padding:24px"><table style="width:100%;border-collapse:collapse;font-size:14px">${rows}</table></div></div></div>`;
  const text = [`Electra Smart CRM — ${email.title}`, "", ...email.lines.map(([label, value]) => `${label}: ${value}`)].join("\n");

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to, subject: email.subject, html, text }),
    });
    if (!response.ok) throw new Error(`Resend HTTP ${response.status}: ${(await response.text()).slice(0, 300)}`);
    return true;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown Resend email error.";
    console.error("[backup-email] delivery failed", { message });
    if (process.env.SENTRY_DSN) Sentry.captureException(error);
    return false;
  }
}

export async function sendBackupSuccessReport(job: {
  id: string;
  type: string;
  fileName?: string | null;
  fileSize?: bigint | null;
  durationMs?: number | null;
  checksum?: string | null;
  tableCount?: number | null;
  databaseSize?: bigint | null;
  verificationStatus?: string | null;
}) {
  return sendBackupEmail({
    subject: `Backup successful — ${job.type}`,
    title: "Daily Backup Success Report",
    tone: "success",
    lines: [
      ["Backup type", job.type],
      ["File", job.fileName ?? job.id],
      ["Verification", job.verificationStatus ?? "Verified"],
      ["File size", formatBytes(job.fileSize)],
      ["Database size", formatBytes(job.databaseSize)],
      ["Tables", String(job.tableCount ?? "Not available")],
      ["Duration", formatDuration(job.durationMs)],
      ["Checksum", job.checksum ?? "Not available"],
    ],
  });
}

export async function sendBackupFailureAlert(input: { stage: string; message: string; jobId?: string }) {
  return sendBackupEmail({
    subject: "Backup failure alert",
    title: "Backup Failure Alert",
    tone: "danger",
    lines: [["Stage", input.stage], ["Job", input.jobId ?? "Not available"], ["Error", input.message]],
  });
}

export async function sendRestoreReport(input: {
  passed: boolean;
  backupName?: string | null;
  durationMs?: number | null;
  operator?: string | null;
  error?: string | null;
}) {
  return sendBackupEmail({
    subject: input.passed ? "Staging restore successful" : "Staging restore failure alert",
    title: input.passed ? "Restore Success Report" : "Restore Failure Alert",
    tone: input.passed ? "success" : "danger",
    lines: [
      ["Environment", "Staging (isolated)"],
      ["Backup", input.backupName ?? "Not available"],
      ["Operator", input.operator ?? "GitHub Actions"],
      ["Duration", formatDuration(input.durationMs)],
      ["Result", input.passed ? "Success" : "Failed"],
      ...(input.error ? [["Error", input.error] as [string, string]] : []),
    ],
  });
}

export async function sendWeeklyBackupHealthReport() {
  try {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const [successful, failed, latest] = await Promise.all([
      prisma.backupJob.count({ where: { createdAt: { gte: weekAgo }, status: "Success" } }),
      prisma.backupJob.count({ where: { createdAt: { gte: weekAgo }, status: { in: ["Failed", "Verification Failed"] } } }),
      prisma.backupJob.findFirst({ where: { status: "Success" }, orderBy: { completedAt: "desc" } }),
    ]);
    const total = successful + failed;
    const sent = await sendBackupEmail({
      subject: "Weekly backup health report",
      title: "Weekly Backup Health Report",
      tone: failed > 0 ? "info" : "success",
      lines: [
        ["Successful backups (7 days)", String(successful)],
        ["Failed backups (7 days)", String(failed)],
        ["Success rate", total ? `${Math.round((successful / total) * 100)}%` : "No completed backups"],
        ["Latest backup", latest?.fileName ?? "Not available"],
        ["Latest verification", latest?.verificationStatus ?? "Not available"],
        ["Latest backup size", formatBytes(latest?.fileSize)],
      ],
    });
    if (sent) {
      await createAuditLog({ module: "Backup", action: "Weekly Backup Health Report Sent", userName: "System", entityName: latest?.fileName ?? "Weekly report" });
    }
    return sent;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown weekly backup report error.";
    console.error("[backup-email] weekly health report failed", { message });
    if (process.env.SENTRY_DSN) Sentry.captureException(error);
    return false;
  }
}
