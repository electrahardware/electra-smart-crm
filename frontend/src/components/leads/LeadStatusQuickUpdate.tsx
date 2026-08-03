import { Check } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { LEAD_STATUSES } from "../../constants/statusConfig";
import type { Lead } from "../../types/lead";
import { updateLead } from "../../services/leadService";

type Props = { leadId: number; currentStatus?: string | null; onUpdated?: (lead: Lead) => void; onStatusChange?: (status: string) => void; compact?: boolean; deferSave?: boolean; };

export default function LeadStatusQuickUpdate({ leadId, currentStatus, onUpdated, onStatusChange, compact = false, deferSave = false }: Props) {
  const [status, setStatus] = useState(currentStatus || "None"); const [saving, setSaving] = useState(false);
  useEffect(() => setStatus(currentStatus || "None"), [currentStatus]);
  const changed = status !== (currentStatus || "None");
  async function save() { try { setSaving(true); const updated = await updateLead(leadId, { status } as Lead); onUpdated?.(updated); window.dispatchEvent(new Event("lead-updated")); toast.success("Lead status updated."); } catch (error) { console.error(error); setStatus(currentStatus || "None"); toast.error("Unable to update lead status."); } finally { setSaving(false); } }
  return <div className={`flex items-center gap-1.5 ${compact ? "min-w-[155px]" : ""}`}><select value={status} onChange={(event) => { setStatus(event.target.value); onStatusChange?.(event.target.value); }} className={`border border-zinc-200 bg-white text-zinc-700 ${compact ? "h-9 min-w-0 px-2 text-xs" : "h-11 w-full px-3 text-sm"}`} aria-label="Lead status">{LEAD_STATUSES.map((item) => <option key={item} value={item}>{item}</option>)}</select>{!deferSave && changed && <button type="button" onClick={save} disabled={saving} title="Save status" className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-emerald-600 text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-50"><Check size={16} /></button>}</div>;
}
