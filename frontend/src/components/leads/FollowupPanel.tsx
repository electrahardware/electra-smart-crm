import { useCallback, useEffect, useState } from "react";
import { getLeads } from "../../services/leadService";
import type { Lead } from "../../types/lead";
import FollowupCard from "./FollowupCard";

export default function FollowupPanel() {
  const [todayLeads, setTodayLeads] = useState<Lead[]>([]);
  const [overdueLeads, setOverdueLeads] = useState<Lead[]>([]);

  const loadLeads = useCallback(async () => {
    try {
      const response = await getLeads();

      const leads = response.data;

      const today = new Date().toISOString().slice(0, 10);

      setTodayLeads(
        leads.filter(
          (lead) =>
            !lead.followupCompleted &&
            lead.followupDate &&
            lead.followupDate.slice(0, 10) === today,
        ),
      );

      setOverdueLeads(
        leads.filter(
          (lead) =>
            !lead.followupCompleted &&
            lead.followupDate &&
            lead.followupDate.slice(0, 10) < today,
        ),
      );
    } catch (err) {
      console.error(err);
    }
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
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">🔔 Follow-ups</h2>

        <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
          Today : {todayLeads.length}
        </span>
      </div>

      {overdueLeads.length > 0 && (
        <>
          <h3 className="mb-4 text-xl font-bold text-red-600">
            🔴 Overdue Follow-ups ({overdueLeads.length})
          </h3>

          <div className="space-y-4 mb-8">
            {overdueLeads.map((lead) => (
              <FollowupCard key={lead.id} lead={lead} onUpdated={loadLeads} />
            ))}
          </div>
        </>
      )}

      <h3 className="mb-4 text-xl font-bold">🟢 Today's Follow-ups</h3>

      {todayLeads.length === 0 ? (
        <div className="py-8 text-center text-slate-500">
          🎉 No Follow-ups for Today
        </div>
      ) : (
        <div className="space-y-4">
          {todayLeads.map((lead) => (
            <FollowupCard key={lead.id} lead={lead} onUpdated={loadLeads} />
          ))}
        </div>
      )}
    </div>
  );
}
