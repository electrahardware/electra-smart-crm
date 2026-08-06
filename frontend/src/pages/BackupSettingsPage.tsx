import { Database, Download, History, Play, RefreshCw, ShieldAlert, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

import ConfirmDialog from "../components/common/ConfirmDialog";
import MainLayout from "../layouts/MainLayout";
import { deleteBackup, downloadBackup, getBackupJobs, getBackupOverview, requestManualBackup, saveBackupSettings, testBackupDrive, type BackupJob, type BackupOverview } from "../services/backupService";
import { isOwner } from "../utils/auth";

const dateTime = (value?: string | null) => value ? new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)) : "Never run";
const size = (value?: string | number | null) => value ? `${(Number(value) / 1024 / 1024).toFixed(2)} MB` : "—";

export default function BackupSettingsPage() {
  const [overview, setOverview] = useState<BackupOverview | null>(null);
  const [jobs, setJobs] = useState<BackupJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<BackupJob | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [nextOverview, history] = await Promise.all([getBackupOverview(), getBackupJobs()]);
      setOverview(nextOverview);
      setJobs(history.data);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to load backup data.");
    } finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, []);

  if (!isOwner()) return <Navigate to="/dashboard" replace />;
  if (loading) return <MainLayout><div className="p-6 text-slate-500">Loading secure backup status…</div></MainLayout>;
  if (!overview) return <MainLayout><div className="p-6 text-red-600">{message || "Backup settings are unavailable."}</div></MainLayout>;

  const update = async (changes: Partial<BackupOverview["settings"]>) => {
    setBusy(true); setMessage("");
    try {
      const settings = await saveBackupSettings({ automaticEnabled: changes.automaticEnabled ?? overview.settings.automaticEnabled, frequency: "Daily", backupTime: changes.backupTime ?? overview.settings.backupTime, retentionCount: changes.retentionCount ?? overview.settings.retentionCount });
      setOverview({ ...overview, settings }); setMessage("Backup settings saved.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to save settings."); }
    finally { setBusy(false); }
  };
  const manual = async () => {
    if (!window.confirm("Create an encrypted manual database backup now?")) return;
    setBusy(true); setMessage("");
    try { await requestManualBackup(); setMessage("Manual backup queued in GitHub Actions."); await load(); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Manual backup could not start."); }
    finally { setBusy(false); }
  };

  return <MainLayout>
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4"><div><h1 className="text-3xl font-bold text-slate-900">Database Backup</h1><p className="mt-1 text-sm text-slate-500">Encrypted Neon PostgreSQL backups stored privately in Google Drive.</p></div><span className={`rounded-full px-3 py-1 text-sm font-semibold ${overview.activeJob ? "bg-amber-100 text-amber-700" : overview.latest ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"}`}>{overview.activeJob ? "Running" : overview.latest ? "Success" : "Never Run"}</span></div>
      {message && <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">{message}</div>}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[ ["Last Backup", dateTime(overview.settings.lastBackupAt)], ["Next Backup", overview.settings.automaticEnabled ? dateTime(overview.settings.nextBackupAt) : "Automatic backup is off"], ["Latest Backup Size", size(overview.latest?.fileSize)], ["Cloud Destination", overview.driveConfigured ? "Google Drive configured" : "Google Drive setup required"] ].map(([label, value]) => <div key={label} className="rounded-2xl border bg-white p-5 shadow-sm"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p><p className="mt-3 font-semibold text-slate-900">{value}</p></div>)}
      </section>
      <section className="rounded-2xl border bg-white p-6 shadow-sm"><div className="flex items-center gap-2"><Database size={20} className="text-red-600"/><h2 className="text-lg font-bold">Automatic Backup Settings</h2></div><div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-4"><label className="flex items-center justify-between rounded-xl border p-3 text-sm font-medium">Automatic backup <input aria-label="Automatic backup" type="checkbox" checked={overview.settings.automaticEnabled} disabled={busy} onChange={(event) => void update({ automaticEnabled: event.target.checked })}/></label><label className="text-sm font-medium">Frequency<select disabled className="mt-2 w-full rounded-xl border p-2.5"><option>Every Day</option></select></label><label className="text-sm font-medium">Backup time (Asia/Kolkata)<input type="time" value={overview.settings.backupTime} disabled={busy} onChange={(event) => void update({ backupTime: event.target.value })} className="mt-2 w-full rounded-xl border p-2.5"/></label><label className="text-sm font-medium">Automatic retention<input type="number" min="1" max="90" value={overview.settings.retentionCount} disabled={busy} onChange={(event) => void update({ retentionCount: Number(event.target.value) })} className="mt-2 w-full rounded-xl border p-2.5"/></label></div><p className="mt-4 text-xs text-slate-500">GitHub Actions runs at 20:30 UTC, which is 02:00 AM IST on the following day. Only the last 30 automatic encrypted backups are retained; Manual and Snapshot backups are never auto-deleted.</p></section>
      <section className="flex flex-wrap gap-3 rounded-2xl border bg-white p-6 shadow-sm"><button onClick={() => void manual()} disabled={busy || Boolean(overview.activeJob)} className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"><Play size={16}/>Take Backup Now</button><button onClick={() => overview.latest && void downloadBackup(overview.latest.id, overview.latest.fileName || "electra-crm-latest.dump.enc")} disabled={!overview.latest || busy} className="inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold disabled:opacity-50"><Download size={16}/>Download Latest Backup</button><button onClick={() => void (async () => { try { await testBackupDrive(); setMessage("Google Drive connection verified."); } catch (error) { setMessage(error instanceof Error ? error.message : "Google Drive connection failed."); } })()} className="inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold"><RefreshCw size={16}/>Test Google Drive</button><button disabled title="A successful temporary Neon staging restore is required before production restore can be enabled." className="inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm font-semibold text-amber-800 opacity-70"><ShieldAlert size={16}/>Restore Backup — staging verification required</button></section>
      <section className="rounded-2xl border bg-white shadow-sm"><div className="flex items-center gap-2 border-b p-6"><History size={20} className="text-red-600"/><h2 className="text-lg font-bold">Backup History</h2></div><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="p-4">Date & Time</th><th>Type</th><th>Status</th><th>File</th><th>Size</th><th>Duration</th><th className="p-4">Actions</th></tr></thead><tbody>{jobs.map((job) => <tr key={job.id} className="border-t"><td className="p-4">{dateTime(job.completedAt || job.createdAt)}</td><td>{job.type}</td><td><span className={`rounded-full px-2 py-1 text-xs font-semibold ${job.status === "Success" ? "bg-green-100 text-green-700" : job.status === "Failed" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>{job.status}</span></td><td>{job.fileName || "—"}</td><td>{size(job.fileSize)}</td><td>{job.durationMs ? `${Math.ceil(job.durationMs / 1000)}s` : "—"}</td><td className="p-4"><div className="flex gap-2">{job.status === "Success" && <button aria-label={`Download ${job.fileName}`} onClick={() => void downloadBackup(job.id, job.fileName || "backup.enc")} className="rounded-lg border p-2"><Download size={15}/></button>}{job.status === "Success" && job.id !== overview.settings.latestBackupJobId && <button aria-label={`Delete ${job.fileName}`} onClick={() => setDeleteTarget(job)} className="rounded-lg border border-red-200 p-2 text-red-600"><Trash2 size={15}/></button>}</div></td></tr>)}{jobs.length === 0 && <tr><td colSpan={7} className="p-8 text-center text-slate-500">No backup history yet.</td></tr>}</tbody></table></div></section>
      <ConfirmDialog open={Boolean(deleteTarget)} title="Delete backup?" message="This permanently deletes the encrypted backup from Google Drive. This action cannot be undone." confirmText="Delete Backup" loading={busy} onCancel={() => setDeleteTarget(null)} onConfirm={() => void (async () => { if (!deleteTarget) return; setBusy(true); try { await deleteBackup(deleteTarget.id); setMessage("Backup deleted."); setDeleteTarget(null); await load(); } catch (error) { setMessage(error instanceof Error ? error.message : "Backup deletion failed."); } finally { setBusy(false); } })()}/>
    </div>
  </MainLayout>;
}
