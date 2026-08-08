import { CalendarClock, Check, MessageCircle, Phone, Sparkles } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import LeadNotesDialog from "../leads/LeadNotesDialog";
import LeadStatusQuickUpdate from "../leads/LeadStatusQuickUpdate";
import RescheduleFollowupDialog from "../leads/RescheduleFollowupDialog";
import type { AiDailyLeadItem } from "../../services/aiDailyLeadService";
import type { Lead } from "../../types/lead";

type Props = { item: AiDailyLeadItem; onCompleted: (itemId: string) => Promise<void>; onUpdated: () => void; onEdit: (lead: Lead) => void; };

export default function AiDailyLeadCard({ item, onCompleted, onUpdated, onEdit }: Props) {
  const [notesOpen, setNotesOpen] = useState(false); const [rescheduleOpen, setRescheduleOpen] = useState(false); const [saving, setSaving] = useState(false); const [lead, setLead] = useState(item.lead);
  async function complete() { try { setSaving(true); await onCompleted(item.id); toast.success("AI Daily Lead marked done."); } catch (error) { console.error(error); toast.error("Unable to complete AI Daily Lead."); } finally { setSaving(false); } }
  const customer = lead.customerName || "Unnamed Lead";
  const lastFollowup = item.lastFollowupAt ? new Intl.DateTimeFormat("en-GB").format(new Date(item.lastFollowupAt)).replace(/\//g, "-") : "No follow-up yet";
  return <>
    <article className={`premium-surface overflow-hidden p-5 ${item.completedAt ? "opacity-60" : ""}`}>
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3"><h2 className="truncate text-lg font-bold text-white">{lead.shopName || customer}</h2><span className="inline-flex items-center gap-1 rounded-full border border-red-400/25 bg-red-500/10 px-2.5 py-1 text-xs font-bold text-red-200"><Sparkles size={13} />AI Score {item.aiScore}</span>{item.completedAt && <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-bold text-emerald-300">Completed</span>}</div>
          <p className="mt-1 text-sm text-zinc-300">{customer}</p><div className="mt-3 flex flex-wrap gap-2 text-xs"><span className="rounded-full bg-white/5 px-3 py-1.5 text-zinc-300">Owner: {lead.leadOwner || "-"}</span><span className="rounded-full bg-white/5 px-3 py-1.5 text-zinc-300">Last follow-up: {lastFollowup}</span></div>
          <div className="mt-4 rounded-xl border border-red-400/15 bg-red-500/[0.06] p-3"><p className="text-xs font-semibold uppercase tracking-wide text-red-300">Why AI selected this lead</p><p className="mt-1 text-sm text-zinc-200">{item.aiReason}</p></div>
          <p className="mt-3 line-clamp-2 text-sm text-zinc-400"><span className="font-medium text-zinc-300">Last note:</span> {item.lastNote || "No notes available"}</p>
        </div>
        {!item.completedAt && <div className="flex max-w-full flex-wrap gap-2 xl:max-w-[520px] xl:justify-end"><a href={`tel:${lead.mobile}`} className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-500"><Phone size={15} />Call</a><a href={`https://wa.me/91${lead.mobile}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500"><MessageCircle size={15} />WhatsApp</a><button type="button" onClick={() => onEdit(lead)} className="rounded-lg bg-amber-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-amber-400">Edit</button><button type="button" onClick={() => setNotesOpen(true)} className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500">Notes</button><button type="button" onClick={() => setRescheduleOpen(true)} className="inline-flex items-center gap-1.5 rounded-lg bg-orange-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-orange-500"><CalendarClock size={15} />Reschedule</button><LeadStatusQuickUpdate leadId={lead.id ?? 0} currentStatus={lead.status} compact onUpdated={(updated) => { setLead(updated); onUpdated(); }} /><button type="button" disabled={saving} onClick={complete} className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-60"><Check size={15} />{saving ? "Saving..." : "Done"}</button></div>}
      </div>
    </article>
    <LeadNotesDialog open={notesOpen} leadId={lead.id ?? 0} lead={lead} onClose={() => setNotesOpen(false)} onLeadUpdated={setLead} />
    <RescheduleFollowupDialog open={rescheduleOpen} lead={lead} onClose={() => setRescheduleOpen(false)} onUpdated={onUpdated} onLeadUpdated={setLead} />
  </>;
}
