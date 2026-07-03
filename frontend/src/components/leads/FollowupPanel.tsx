import { useEffect, useState } from "react";
import { getLeads } from "../../services/leadService";
import type { Lead } from "../../types/lead";
import FollowupCard from "./FollowupCard";

export default function FollowupPanel() {
  const [todayLeads, setTodayLeads] = useState<Lead[]>([]);
  const [overdueLeads, setOverdueLeads] = useState<Lead[]>([]);

  useEffect(() => {
    loadLeads();

    const interval = setInterval(() => {
      loadLeads();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  async function loadLeads() {
    try {
      const leads = await getLeads();

      const today = new Date()
        .toISOString()
        .slice(0, 10);

      const todayList = leads.filter(
        (lead) =>
          lead.followupDate &&
          lead.followupDate.slice(0, 10) === today
      );

      const overdueList = leads.filter(
        (lead) =>
          lead.followupDate &&
          lead.followupDate.slice(0, 10) < today
      );

      setTodayLeads(todayList);
      setOverdueLeads(overdueList);

    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow border border-slate-200 p-6">

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">
          🔔 Follow-ups
        </h2>

        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
          Today : {todayLeads.length}
        </span>
      </div>

      {overdueLeads.length > 0 && (
        <div className="mb-8">

          <h3 className="text-xl font-bold text-red-600 mb-4">
            🔴 Overdue Follow-ups ({overdueLeads.length})
          </h3>

          <div className="space-y-4">

            {overdueLeads.map((lead) => (
              <FollowupCard
                key={lead.id}
                lead={lead}
              />
            ))}

          </div>

        </div>
      )}

      <h3 className="text-xl font-bold mb-4">
        🟢 Today's Follow-ups
      </h3>

      {todayLeads.length === 0 ? (

        <div className="text-center py-8 text-slate-500">
          🎉 No Follow-ups for Today
        </div>

      ) : (

        <div className="space-y-4">

          {todayLeads.map((lead) => (
            <FollowupCard
              key={lead.id}
              lead={lead}
            />
          ))}

        </div>

      )}

    </div>
  );
}