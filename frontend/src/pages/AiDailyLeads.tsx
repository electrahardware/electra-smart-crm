import { Archive, RefreshCw, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

import AiDailyLeadCard from "../components/aiDailyLeads/AiDailyLeadCard";
import LeadWizard from "../components/leads/LeadWizard";
import { useLead } from "../hooks/useLead";
import MainLayout from "../layouts/MainLayout";
import { completeAiDailyLead, getAiDailyLeadArchive, getAiDailyLeadExecutives, getAiDailyLeads, regenerateAiDailyLeads, type AiDailyLeadResponse, type AiExecutive } from "../services/aiDailyLeadService";
import { isOwner, isOwnerOrManager } from "../utils/auth";
import { EmptyLead, type Lead } from "../types/lead";

export default function AiDailyLeads() {
  const privileged = isOwnerOrManager();
  const { setLead, setEditingId, wizardOpen, setWizardOpen } = useLead();
  const [selectedExecutiveId, setSelectedExecutiveId] = useState<number | undefined>();
  const [executives, setExecutives] = useState<AiExecutive[]>([]);
  const [data, setData] = useState<AiDailyLeadResponse | null>(null);
  const [archive, setArchive] = useState<Array<{ id: string; batchDate: string; salesExecutive: { name: string }; _count: { items: number } }>>([]);
  const [archiveDays, setArchiveDays] = useState<1 | 7 | 30>(7);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);

  async function load() {
    try {
      setLoading(true);
      const [batch, people, history] = await Promise.all([
        getAiDailyLeads(selectedExecutiveId),
        privileged ? getAiDailyLeadExecutives() : Promise.resolve([]),
        getAiDailyLeadArchive(archiveDays, selectedExecutiveId),
      ]);
      setData(batch); setExecutives(people); setArchive(history);
    } catch (error) { console.error(error); toast.error("Unable to load AI Daily Leads."); }
    finally { setLoading(false); }
  }

  useEffect(() => { void load(); }, [selectedExecutiveId, archiveDays]);

  const visibleItems = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return data?.items.filter((item) => !item.completedAt) ?? [];
    return (data?.items ?? []).filter((item) => !item.completedAt && [item.lead.customerName, item.lead.shopName, item.lead.mobile, item.aiReason].filter(Boolean).join(" ").toLowerCase().includes(keyword));
  }, [data, search]);

  async function markDone(itemId: string) {
    await completeAiDailyLead(itemId);
    setData((previous) => previous ? {
      ...previous,
      items: previous.items.map((item) => item.id === itemId ? { ...item, completedAt: new Date().toISOString() } : item),
      stats: { ...previous.stats, completed: previous.stats.completed + 1, remaining: Math.max(0, previous.stats.remaining - 1), completionPercent: previous.stats.total ? Math.round(((previous.stats.completed + 1) / previous.stats.total) * 100) : 0 },
    } : previous);
  }

  function editLead(lead: Lead) {
    setEditingId(lead.id ?? null);
    setLead({ ...EmptyLead, ...lead });
    setWizardOpen(true);
  }

  async function regenerate() {
    if (!selectedExecutiveId) { toast.error("Select one Sales Executive before regenerating."); return; }
    try { setRegenerating(true); await regenerateAiDailyLeads(selectedExecutiveId); toast.success("AI Daily Leads batch regenerated."); await load(); }
    catch (error) { console.error(error); toast.error("Unable to regenerate this batch."); }
    finally { setRegenerating(false); }
  }

  const cards = [
    ["Today's AI Leads", data?.stats.total ?? 0, "text-blue-300"],
    ["Completed", data?.stats.completed ?? 0, "text-emerald-300"],
    ["Remaining", data?.stats.remaining ?? 0, "text-amber-300"],
    ["Completion", `${data?.stats.completionPercent ?? 0}%`, "text-violet-300"],
    ["Average AI Score", data?.stats.averageScore ?? 0, "text-red-200"],
  ];

  return <MainLayout>
    <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div><p className="text-xs font-semibold uppercase tracking-[.2em] text-red-300">AI Daily Leads</p><h1 className="mt-2 flex items-center gap-3 text-3xl font-bold text-white"><Sparkles className="text-red-400" /> Best leads for today</h1><p className="mt-2 text-sm text-zinc-400">A fixed, score-based batch generated from notes, history and customer activity.</p></div>
      <div className="flex flex-wrap gap-2">
        {isOwner() && <Link to="/ai-daily-leads/configuration" className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-zinc-200 transition hover:bg-white/10">AI Configuration</Link>}
        {privileged && <button type="button" onClick={regenerate} disabled={regenerating || !selectedExecutiveId} className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"><RefreshCw size={16} className={regenerating ? "animate-spin" : ""} />Regenerate selected batch</button>}
      </div>
    </div>

    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">{cards.map(([label, value, color]) => <div key={String(label)} className="premium-surface p-5"><p className="text-sm text-zinc-400">{label}</p><p className={`mt-3 text-3xl font-bold ${color}`}>{value}</p></div>)}</div>

    <section className="premium-surface mt-6 p-5">
      <div className="flex flex-col gap-3 lg:flex-row">
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search inside today's AI leads..." className="h-11 flex-1 rounded-xl border border-white/10 bg-black/20 px-4 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-red-400/60" />
        {privileged && <select value={selectedExecutiveId ?? ""} onChange={(event) => setSelectedExecutiveId(event.target.value ? Number(event.target.value) : undefined)} className="h-11 min-w-56 rounded-xl border border-white/10 bg-[#17191d] px-3 text-sm text-zinc-100 outline-none"><option value="">All Sales Executives</option>{executives.map((person) => <option key={person.id} value={person.id}>{person.name}</option>)}</select>}
      </div>
    </section>

    <section className="mt-6"><div className="mb-4 flex items-center justify-between"><h2 className="text-xl font-bold text-white">Today's Batch</h2><span className="text-sm text-zinc-400">{visibleItems.length} active leads</span></div>
      {loading ? <div className="premium-surface p-12 text-center text-zinc-400">Loading AI Daily Leads...</div> : visibleItems.length ? <div className="space-y-4">{visibleItems.map((item) => <AiDailyLeadCard key={item.id} item={item} onCompleted={markDone} onUpdated={load} onEdit={editLead} />)}</div> : <div className="premium-surface p-12 text-center"><Sparkles className="mx-auto text-red-400" size={32} /><h2 className="mt-4 text-xl font-bold text-white">No AI Daily Leads remaining</h2><p className="mt-2 text-sm text-zinc-400">The next fixed batch will be generated at 2:00 AM.</p></div>}
    </section>

    <section className="premium-surface mt-8 p-6"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-3"><span className="rounded-xl bg-red-500/10 p-2 text-red-300"><Archive size={20} /></span><div><h2 className="font-bold text-white">Archive</h2><p className="text-sm text-zinc-400">Previous fixed AI lead batches</p></div></div><div className="flex gap-2">{([1, 7, 30] as const).map((days) => <button type="button" key={days} onClick={() => setArchiveDays(days)} className={`rounded-lg px-3 py-2 text-sm ${archiveDays === days ? "bg-red-600 text-white" : "bg-white/5 text-zinc-300 hover:bg-white/10"}`}>{days === 1 ? "Yesterday" : `Last ${days} Days`}</button>)}</div></div>
      <div className="mt-5 divide-y divide-white/10">{archive.length ? archive.map((batch) => <div key={batch.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm"><div><p className="font-semibold text-zinc-100">{new Intl.DateTimeFormat("en-GB").format(new Date(batch.batchDate)).replace(/\//g, "-")}</p><p className="text-zinc-500">{batch.salesExecutive.name}</p></div><span className="rounded-full bg-white/5 px-3 py-1 text-zinc-300">{batch._count.items} leads</span></div>) : <p className="py-6 text-center text-sm text-zinc-500">No archived batches in this period.</p>}</div>
    </section>
    {wizardOpen && <LeadWizard onClose={() => { setWizardOpen(false); void load(); }} />}
  </MainLayout>;
}
