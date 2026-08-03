import { useCallback, useEffect, useState } from "react";
import { BellRing, CalendarCheck2, Inbox, TriangleAlert } from "lucide-react";
import { getFollowups } from "../../services/followupService";
import type { Lead } from "../../types/lead";
import FollowupCard from "./FollowupCard";

export default function FollowupPanel() {
  const [todayLeads, setTodayLeads] = useState<Lead[]>([]);
  const [overdueLeads, setOverdueLeads] = useState<Lead[]>([]);

  const loadLeads = useCallback(async () => {
    try {
      const [today, overdue] = await Promise.all([getFollowups("today"), getFollowups("overdue")]);
      setTodayLeads(today);
      setOverdueLeads(overdue);
    } catch (err) { console.error(err); }
  }, []);

  useEffect(() => {
    loadLeads();
    window.addEventListener("lead-imported", loadLeads);
    window.addEventListener("lead-updated", loadLeads);
    return () => {
      window.removeEventListener("lead-imported", loadLeads);
      window.removeEventListener("lead-updated", loadLeads);
    };
  }, [loadLeads]);

  return (
    <section className="premium-surface p-5 sm:p-6">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3"><span className="premium-icon-tile"><BellRing size={19} /></span><h2 className="text-xl font-bold tracking-[-.025em]">Follow-ups</h2></div>
        <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-[#be171d]">Today: {todayLeads.length}</span>
      </div>

      {overdueLeads.length > 0 && <>
        <h3 className="mb-4 flex items-center gap-2 text-base font-bold text-[#be171d]"><TriangleAlert size={17} /> Overdue Follow-ups ({overdueLeads.length})</h3>
        <div className="mb-7 space-y-4">{overdueLeads.map((lead) => <FollowupCard key={lead.id} lead={lead} onUpdated={loadLeads} />)}</div>
      </>}

      <h3 className="mb-4 flex items-center gap-2 text-base font-bold"><CalendarCheck2 size={17} className="text-[#e31e24]" /> Today's Follow-ups</h3>
      {todayLeads.length === 0 ? (
        <div className="premium-empty-state px-5 py-7 text-sm"><div><Inbox className="mx-auto mb-2 text-zinc-400" size={24} /><p>No follow-ups scheduled for today</p></div></div>
      ) : <div className="space-y-4">{todayLeads.map((lead) => <FollowupCard key={lead.id} lead={lead} onUpdated={loadLeads} />)}</div>}
    </section>
  );
}
