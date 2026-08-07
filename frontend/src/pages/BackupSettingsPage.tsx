import {
  Database,
  Download,
  FileText,
  History,
  LoaderCircle,
  Play,
  RefreshCw,
  ShieldAlert,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

import ConfirmDialog from "../components/common/ConfirmDialog";
import Toast from "../components/common/Toast";
import MainLayout from "../layouts/MainLayout";
import {
  deleteBackup,
  downloadBackup,
  getBackupJobs,
  getBackupOverview,
  getRestoreJobs,
  requestManualBackup,
  requestStagingRestore,
  saveBackupSettings,
  testBackupDrive,
  type BackupJob,
  type BackupOverview,
  type RestoreJob,
} from "../services/backupService";
import { isOwner } from "../utils/auth";

const dateTime = (value?: string | null) =>
  value
    ? new Intl.DateTimeFormat("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(value))
    : "Never run";
const size = (value?: string | number | null) =>
  value ? `${(Number(value) / 1024 / 1024).toFixed(2)} MB` : "—";
const verificationTime = (value: Date) =>
  new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  }).format(value);

export default function BackupSettingsPage() {
  const [overview, setOverview] = useState<BackupOverview | null>(null);
  const [jobs, setJobs] = useState<BackupJob[]>([]);
  const [restoreJobs, setRestoreJobs] = useState<RestoreJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<BackupJob | null>(null);
  const [testingDrive, setTestingDrive] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [lastVerifiedAt, setLastVerifiedAt] = useState<Date | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [reportJob, setReportJob] = useState<RestoreJob | null>(null);

  const notify = (nextMessage: string, type: "success" | "error") =>
    setToast({ message: nextMessage, type });

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 5000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const load = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [nextOverview, history, restores] = await Promise.all([
        getBackupOverview(),
        getBackupJobs(),
        getRestoreJobs(),
      ]);
      setOverview(nextOverview);
      setJobs(history.data);
      setRestoreJobs(restores);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Unable to load backup data.",
      );
    } finally {
      if (!silent) setLoading(false);
    }
  };
  useEffect(() => {
    void load();
  }, []);
  useEffect(() => {
    if (
      !restoreJobs.some(
        (job) => job.status === "Queued" || job.status === "Running",
      )
    )
      return;
    const timer = window.setInterval(() => void load(true), 10_000);
    return () => window.clearInterval(timer);
  }, [restoreJobs]);

  if (!isOwner()) return <Navigate to="/dashboard" replace />;
  if (loading)
    return (
      <MainLayout>
        <div className="p-6 text-slate-500">Loading secure backup status…</div>
      </MainLayout>
    );
  if (!overview)
    return (
      <MainLayout>
        <div className="p-6 text-red-600">
          {message || "Backup settings are unavailable."}
        </div>
      </MainLayout>
    );

  const restoreTested = (backupJobId: string) =>
    restoreJobs.some(
      (item) =>
        item.backupJobId === backupJobId &&
        item.stage === "Staging" &&
        item.status === "Success" &&
        item.verificationResult?.passed,
    );
  const restoreRunning = (backupJobId: string) =>
    restoreJobs.some(
      (item) =>
        item.backupJobId === backupJobId &&
        ["Queued", "Running"].includes(item.status),
    );

  const update = async (changes: Partial<BackupOverview["settings"]>) => {
    setBusy(true);
    try {
      const settings = await saveBackupSettings({
        automaticEnabled:
          changes.automaticEnabled ?? overview.settings.automaticEnabled,
        frequency: "Daily",
        backupTime: changes.backupTime ?? overview.settings.backupTime,
        retentionCount:
          changes.retentionCount ?? overview.settings.retentionCount,
      });
      setOverview({ ...overview, settings });
      notify("Backup settings saved.", "success");
    } catch (error) {
      notify(
        error instanceof Error ? error.message : "Unable to save settings.",
        "error",
      );
    } finally {
      setBusy(false);
    }
  };

  const manual = async () => {
    if (!window.confirm("Create an encrypted manual database backup now?"))
      return;
    setBusy(true);
    try {
      await requestManualBackup();
      notify("Manual backup queued in GitHub Actions.", "success");
      await load();
    } catch (error) {
      notify(
        error instanceof Error
          ? error.message
          : "Manual backup could not start.",
        "error",
      );
    } finally {
      setBusy(false);
    }
  };

  const verifyDrive = async () => {
    setTestingDrive(true);
    try {
      const result = await testBackupDrive();
      if (!result.connected)
        throw new Error("Google Drive connection could not be verified.");
      setLastVerifiedAt(new Date());
      notify("Google Drive connection verified successfully.", "success");
    } catch (error) {
      notify(
        error instanceof Error
          ? error.message
          : "Google Drive connection could not be verified.",
        "error",
      );
    } finally {
      setTestingDrive(false);
    }
  };

  const download = async (job: BackupJob) => {
    setDownloadingId(job.id);
    try {
      await downloadBackup(job.id, job.fileName || "electra-crm-backup.enc");
      notify("Encrypted backup download started.", "success");
    } catch (error) {
      notify(
        error instanceof Error ? error.message : "Backup download failed.",
        "error",
      );
    } finally {
      setDownloadingId(null);
    }
  };

  const stagingRestore = async (job: BackupJob) => {
    if (
      !job.verified ||
      !window.confirm(
        `Run isolated staging verification for ${job.fileName}? Production will not be touched.`,
      )
    )
      return;
    setBusy(true);
    try {
      await requestStagingRestore(job.id);
      notify(
        "Staging restore verification queued in GitHub Actions.",
        "success",
      );
      await load();
    } catch (error) {
      notify(
        error instanceof Error
          ? error.message
          : "Staging restore could not start.",
        "error",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <MainLayout>
      <Toast
        show={Boolean(toast)}
        message={toast?.message ?? ""}
        type={toast?.type}
      />
      <div className="mx-auto max-w-7xl space-y-6 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Database Backup
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Encrypted Neon PostgreSQL backups stored privately in Google
              Drive.
            </p>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-sm font-semibold ${overview.activeJob ? "bg-amber-100 text-amber-700" : overview.latest ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"}`}
          >
            {overview.activeJob
              ? "Running"
              : overview.latest
                ? "Success"
                : "Never Run"}
          </span>
        </div>
        {message && (
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
            {message}
          </div>
        )}
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {[
            ["Last Backup", dateTime(overview.settings.lastBackupAt)],
            [
              "Backup Age",
              overview.latest?.completedAt
                ? `${Math.max(0, Math.floor((Date.now() - new Date(overview.latest.completedAt).getTime()) / 3_600_000))}h`
                : "—",
            ],
            ["Latest Size", size(overview.latest?.fileSize)],
            [
              "Verified",
              overview.latest?.verified ? "Verified" : "Verification required",
            ],
            ["GitHub", "Configured"],
            [
              "Google Drive",
              overview.driveConfigured ? "Connected" : "Setup required",
            ],
            [
              "Encryption",
              overview.latest?.format?.includes("AES-256-GCM")
                ? "Enabled"
                : "Awaiting backup",
            ],
            [
              "Restore Tested",
              overview.latest && restoreTested(overview.latest.id)
                ? "Passed"
                : "Not yet",
            ],
            ["Retention", `${overview.settings.retentionCount} backups`],
            [
              "Success Rate",
              jobs.length
                ? `${Math.round((jobs.filter((job) => job.status === "Success").length / jobs.length) * 100)}%`
                : "—",
            ],
          ].map(([label, value]) => (
            <div
              key={label}
              className="rounded-2xl border bg-white p-5 shadow-sm"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {label}
              </p>
              <p className="mt-3 font-semibold text-slate-900">{value}</p>
            </div>
          ))}
        </section>
        <section className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <Database size={20} className="text-red-600" />
            <h2 className="text-lg font-bold">Automatic Backup Settings</h2>
          </div>
          <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <label className="flex items-center justify-between rounded-xl border p-3 text-sm font-medium">
              Automatic backup{" "}
              <input
                aria-label="Automatic backup"
                type="checkbox"
                checked={overview.settings.automaticEnabled}
                disabled={busy}
                onChange={(event) =>
                  void update({ automaticEnabled: event.target.checked })
                }
              />
            </label>
            <label className="text-sm font-medium">
              Frequency
              <select disabled className="mt-2 w-full rounded-xl border p-2.5">
                <option>Every Day</option>
              </select>
            </label>
            <label className="text-sm font-medium">
              Backup time (Asia/Kolkata)
              <input
                type="time"
                value={overview.settings.backupTime}
                disabled={busy}
                onChange={(event) =>
                  void update({ backupTime: event.target.value })
                }
                className="mt-2 w-full rounded-xl border p-2.5"
              />
            </label>
            <label className="text-sm font-medium">
              Automatic retention
              <input
                type="number"
                min="1"
                max="90"
                value={overview.settings.retentionCount}
                disabled={busy}
                onChange={(event) =>
                  void update({ retentionCount: Number(event.target.value) })
                }
                className="mt-2 w-full rounded-xl border p-2.5"
              />
            </label>
          </div>
          <p className="mt-4 text-xs text-slate-500">
            GitHub Actions runs at 20:30 UTC, which is 02:00 AM IST on the
            following day. Only the last 30 automatic encrypted backups are
            retained; Manual and Snapshot backups are never auto-deleted.
          </p>
        </section>
        <section className="flex flex-wrap items-center gap-3 rounded-2xl border bg-white p-6 shadow-sm">
          <button
            onClick={() => void manual()}
            disabled={busy || Boolean(overview.activeJob)}
            className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {busy ? (
              <LoaderCircle size={16} className="animate-spin" />
            ) : (
              <Play size={16} />
            )}
            {busy ? "Starting…" : "Take Backup Now"}
          </button>
          <button
            onClick={() => overview.latest && void download(overview.latest)}
            disabled={
              !overview.latest || busy || downloadingId === overview.latest?.id
            }
            className="inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold disabled:opacity-50"
          >
            {downloadingId === overview.latest?.id ? (
              <LoaderCircle size={16} className="animate-spin" />
            ) : (
              <Download size={16} />
            )}
            {downloadingId === overview.latest?.id
              ? "Downloading…"
              : "Download Latest Backup"}
          </button>
          <button
            onClick={() => void verifyDrive()}
            disabled={testingDrive}
            className="inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold disabled:opacity-50"
          >
            {testingDrive ? (
              <LoaderCircle size={16} className="animate-spin" />
            ) : (
              <RefreshCw size={16} />
            )}
            {testingDrive ? "Testing…" : "Test Google Drive"}
          </button>
          {lastVerifiedAt && (
            <span className="text-sm text-emerald-700">
              <span className="font-semibold">Last verified:</span>{" "}
              {verificationTime(lastVerifiedAt)}
            </span>
          )}
          <button
            disabled
            title="A successful temporary Neon staging restore is required before production restore can be enabled."
            className="inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm font-semibold text-amber-800 opacity-70"
          >
            <ShieldAlert size={16} />
            Restore Backup — staging verification required
          </button>
        </section>
        <section className="rounded-2xl border bg-white shadow-sm">
          <div className="flex items-center gap-2 border-b p-6">
            <History size={20} className="text-red-600" />
            <h2 className="text-lg font-bold">Backup History</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="p-4">Date & Time</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>File</th>
                  <th>Size</th>
                  <th>Duration</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr key={job.id} className="border-t">
                    <td className="p-4">
                      {dateTime(job.completedAt || job.createdAt)}
                    </td>
                    <td>{job.type}</td>
                    <td>
                      <div className="flex flex-wrap gap-1">
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-semibold ${job.status === "Success" ? "bg-green-100 text-green-700" : job.status === "Failed" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}
                        >
                          {job.status}
                        </span>
                        {restoreTested(job.id) && (
                          <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-700">
                            Restore Tested
                          </span>
                        )}
                      </div>
                    </td>
                    <td>{job.fileName || "—"}</td>
                    <td>{size(job.fileSize)}</td>
                    <td>
                      {job.durationMs
                        ? `${Math.ceil(job.durationMs / 1000)}s`
                        : "—"}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        {job.status === "Success" && (
                          <button
                            disabled={downloadingId === job.id}
                            aria-label={`Download ${job.fileName}`}
                            onClick={() => void download(job)}
                            className="rounded-lg border p-2 disabled:opacity-50"
                          >
                            {downloadingId === job.id ? (
                              <LoaderCircle
                                size={15}
                                className="animate-spin"
                              />
                            ) : (
                              <Download size={15} />
                            )}
                          </button>
                        )}
                        {job.verified && (
                          <button
                            disabled={busy || restoreRunning(job.id)}
                            onClick={() => void stagingRestore(job)}
                            className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-900 disabled:opacity-50"
                          >
                            {restoreRunning(job.id)
                              ? "Verifying…"
                              : "Staging Verify"}
                          </button>
                        )}
                        {job.status === "Success" &&
                          job.id !== overview.settings.latestBackupJobId && (
                            <button
                              aria-label={`Delete ${job.fileName}`}
                              onClick={() => setDeleteTarget(job)}
                              className="rounded-lg border border-red-200 p-2 text-red-600"
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                      </div>
                    </td>
                  </tr>
                ))}
                {jobs.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-500">
                      No backup history yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
          <div className="flex items-center gap-2 text-amber-900">
            <ShieldAlert size={20} />
            <h2 className="text-lg font-bold">Protected Restore</h2>
          </div>
          <p className="mt-2 text-sm text-amber-800">
            Staging Restore downloads, decrypts and restores into an isolated
            PostgreSQL 18 database. Production is never touched during this
            stage.
          </p>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-amber-200 bg-white p-4">
              <h3 className="font-semibold">Staging Restore</h3>
              <p className="mt-1 text-sm text-slate-600">
                A verified backup is mandatory. The report checks pg_restore,
                schema, tables, rows, indexes, constraints and database version.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {jobs
                  .filter((job) => job.status === "Success")
                  .slice(0, 3)
                  .map((job) => (
                    <button
                      key={job.id}
                      disabled={!job.verified || busy}
                      onClick={() => void stagingRestore(job)}
                      className="rounded-lg border px-3 py-2 text-xs font-semibold disabled:opacity-50"
                    >
                      {job.verified
                        ? `Verify ${job.fileName}`
                        : "Verification required"}
                    </button>
                  ))}
              </div>
            </div>
            <div className="rounded-xl border border-red-200 bg-red-50 p-4">
              <h3 className="font-semibold text-red-900">Production Restore</h3>
              <p className="mt-1 text-sm text-red-800">
                You are about to overwrite Production Database. Emergency
                snapshot, a passed staging report, exact RESTORE confirmation
                and deployment-policy enablement are mandatory.
              </p>
              <button
                disabled
                title="Production restore is disabled by policy."
                className="mt-3 inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-800 opacity-60"
              >
                <ShieldAlert size={16} />
                Production Restore — disabled
              </button>
            </div>
          </div>
        </section>
        <section className="rounded-2xl border bg-white shadow-sm">
          <div className="border-b p-6">
            <h2 className="text-lg font-bold">Restore History</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="p-4">Time</th>
                  <th>Stage</th>
                  <th>Backup</th>
                  <th>Operator</th>
                  <th>IP</th>
                  <th>Duration</th>
                  <th>Status</th>
                  <th>Report</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {restoreJobs.map((item) => (
                  <tr key={item.id} className="border-t">
                    <td className="p-4">
                      {dateTime(item.completedAt || item.createdAt)}
                    </td>
                    <td>{item.stage}</td>
                    <td>{item.backupName || item.backupJobId}</td>
                    <td>{item.initiatedBy || "—"}</td>
                    <td>{item.operatorIp || "—"}</td>
                    <td>
                      {item.durationMs
                        ? `${Math.ceil(item.durationMs / 1000)}s`
                        : "—"}
                    </td>
                    <td>{item.status}</td>
                    <td>
                      <button
                        disabled={
                          !item.verificationResult && !item.errorMessage
                        }
                        onClick={() => setReportJob(item)}
                        className="inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-xs font-semibold disabled:opacity-50"
                      >
                        <FileText size={14} />
                        Report
                      </button>
                    </td>
                    <td>
                      {item.errorMessage ||
                        (item.verificationResult?.passed
                          ? "Integrity passed"
                          : "—")}
                    </td>
                  </tr>
                ))}
                {restoreJobs.length === 0 && (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-slate-500">
                      No restore attempts yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
        <ConfirmDialog
          open={Boolean(deleteTarget)}
          title="Delete backup?"
          message="This permanently deletes the encrypted backup from Google Drive. This action cannot be undone."
          confirmText="Delete Backup"
          loading={busy}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() =>
            void (async () => {
              if (!deleteTarget) return;
              setBusy(true);
              try {
                await deleteBackup(deleteTarget.id);
                notify("Backup deleted.", "success");
                setDeleteTarget(null);
                await load();
              } catch (error) {
                notify(
                  error instanceof Error
                    ? error.message
                    : "Backup deletion failed.",
                  "error",
                );
              } finally {
                setBusy(false);
              }
            })()
          }
        />
        <section className="rounded-2xl border bg-white shadow-sm">
          <div className="border-b p-6">
            <h2 className="text-lg font-bold">Restore Reports</h2>
          </div>
          <div className="divide-y">
            {restoreJobs.map((item) => (
              <div
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-3 p-4 text-sm"
              >
                <div>
                  <p className="font-semibold">
                    {item.backupName || item.backupJobId}
                  </p>
                  <p className="text-slate-500">
                    {item.stage} · {item.status} ·{" "}
                    {item.durationMs
                      ? `${Math.ceil(item.durationMs / 1000)}s`
                      : "Running…"}
                  </p>
                </div>
                <button
                  disabled={!item.verificationResult && !item.errorMessage}
                  onClick={() => setReportJob(item)}
                  className="inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-xs font-semibold disabled:opacity-50"
                >
                  <FileText size={14} />
                  Report
                </button>
              </div>
            ))}
            {restoreJobs.length === 0 && (
              <p className="p-6 text-sm text-slate-500">
                A verified backup can be tested in isolated staging from Backup
                History.
              </p>
            )}
          </div>
        </section>
        {reportJob && (
          <div
            className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 p-4"
            role="dialog"
            aria-modal="true"
            aria-label="Staging restore report"
          >
            <section className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold">Staging Restore Report</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {reportJob.backupName || reportJob.backupJobId}
                  </p>
                </div>
                <button
                  onClick={() => setReportJob(null)}
                  className="rounded-lg border px-3 py-2 text-sm font-semibold"
                >
                  Close
                </button>
              </div>
              <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
                {[
                  ["Result", reportJob.status],
                  [
                    "Duration",
                    reportJob.durationMs
                      ? `${Math.ceil(reportJob.durationMs / 1000)}s`
                      : "—",
                  ],
                  [
                    "PostgreSQL",
                    reportJob.verificationResult?.databaseVersion || "—",
                  ],
                  [
                    "pg_restore exit",
                    String(
                      reportJob.verificationResult?.pgRestoreExitCode ?? "—",
                    ),
                  ],
                  [
                    "Schema",
                    reportJob.verificationResult?.schemaExists
                      ? "Present"
                      : "—",
                  ],
                  [
                    "Tables",
                    String(reportJob.verificationResult?.tableCount ?? "—"),
                  ],
                  [
                    "Rows",
                    String(reportJob.verificationResult?.rowCount ?? "—"),
                  ],
                  [
                    "Indexes",
                    String(reportJob.verificationResult?.indexCount ?? "—"),
                  ],
                  [
                    "Constraints",
                    String(
                      reportJob.verificationResult?.constraintCount ?? "—",
                    ),
                  ],
                  [
                    "Database size",
                    reportJob.verificationResult?.databaseSize
                      ? size(reportJob.verificationResult.databaseSize)
                      : "—",
                  ],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-lg bg-slate-50 p-3">
                    <dt className="text-xs font-semibold uppercase text-slate-500">
                      {label}
                    </dt>
                    <dd className="mt-1 font-medium text-slate-900">{value}</dd>
                  </div>
                ))}
              </dl>
              {reportJob.errorMessage && (
                <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                  {reportJob.errorMessage}
                </p>
              )}
            </section>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
