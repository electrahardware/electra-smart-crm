import { api } from "../lib/api";

export interface BackupJob {
  id: string;
  type: "Automatic" | "Manual" | "Pre-Restore Snapshot";
  status: "Queued" | "Running" | "Success" | "Failed" | "Blocked";
  startedAt?: string | null;
  completedAt?: string | null;
  durationMs?: number | null;
  fileName?: string | null;
  fileSize?: string | number | null;
  storagePath?: string | null;
  createdBy?: string | null;
  errorStage?: string | null;
  errorMessage?: string | null;
  createdAt: string;
}

export interface BackupSettings {
  automaticEnabled: boolean;
  frequency: "Daily";
  backupTime: string;
  timezone: string;
  retentionCount: number;
  lastBackupAt?: string | null;
  nextBackupAt?: string | null;
  latestBackupJobId?: string | null;
}

export interface BackupOverview {
  settings: BackupSettings;
  latest: BackupJob | null;
  activeJob: BackupJob | null;
  productionRestoreEnabled: boolean;
  driveConfigured: boolean;
}

export const getBackupOverview = () => api<BackupOverview>("/backups");
export const getBackupJobs = (page = 1) => api<{ data: BackupJob[]; total: number; page: number; limit: number }>(`/backups/jobs?page=${page}`);
export const saveBackupSettings = (data: Pick<BackupSettings, "automaticEnabled" | "frequency" | "backupTime" | "retentionCount">) => api<BackupSettings>("/backups/settings", { method: "PATCH", body: JSON.stringify(data) });
export const requestManualBackup = () => api<BackupJob>("/backups/manual", { method: "POST" });
export const deleteBackup = (id: string) => api<void>(`/backups/${id}`, { method: "DELETE" });
export const testBackupDrive = () => api<{ connected: boolean }>("/backups/drive/test", { method: "POST" });

export async function downloadBackup(id: string, fileName: string) {
  const baseUrl = import.meta.env.VITE_API_URL;
  const token = sessionStorage.getItem("token");
  const response = await fetch(`${baseUrl}/backups/${id}/download`, { headers: { Authorization: token ? `Bearer ${token}` : "" } });
  if (!response.ok) throw new Error("Backup download failed.");
  const url = URL.createObjectURL(await response.blob());
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}
