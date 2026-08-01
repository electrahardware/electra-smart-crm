import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import FollowupCard from "../components/leads/FollowupCard";
import MainLayout from "../layouts/MainLayout";

import { getFollowups, getTodayFollowups } from "../services/followupService";

import FollowupDashboard from "@/components/leads/FollowupDashboard";
import type { Lead } from "../types/lead";

export default function Followups() {
  const [searchParams] = useSearchParams();

  const defaultFilter =
    searchParams.get("filter") === "overdue" ? "overdue" : "today";

  const [loading, setLoading] = useState(true);

  const [filter, setFilter] = useState<"today" | "overdue">(defaultFilter);

  const [search, setSearch] = useState("");

  const [rows, setRows] = useState<Lead[]>([]);

  const [todayCount, setTodayCount] = useState(0);

  const [overdueCount, setOverdueCount] = useState(0);

  const [upcomingCount, setUpcomingCount] = useState(0);

  const [expectedValue, setExpectedValue] = useState(0);

  useEffect(() => {
    loadFollowups();
  }, [filter]);

  async function loadFollowups() {
    try {
      setLoading(true);

      const data = await getFollowups(filter);

      setRows(data);

      const today = await getTodayFollowups();

      setTodayCount(today.length);

      if (filter === "overdue") {
        setOverdueCount(data.length);
      } else {
        setOverdueCount(0);
      }

      const now = new Date();

      const upcoming = data.filter((lead) => {
        if (!lead.followupDate) return false;

        return new Date(lead.followupDate) > now;
      });

      setUpcomingCount(upcoming.length);

      const total = data.reduce(
        (sum, lead) => sum + (lead.expectedValue ?? 0),
        0,
      );

      setExpectedValue(total);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const filtered = useMemo(() => {
    const keyword = search.toLowerCase();

    return rows.filter((lead) => {
      return (
        lead.customerName.toLowerCase().includes(keyword) ||
        lead.mobile.includes(keyword) ||
        (lead.shopName ?? "").toLowerCase().includes(keyword)
      );
    });
  }, [rows, search]);

  return (
    <MainLayout>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Follow-ups</h1>

          <p className="mt-2 text-slate-500">Manage all customer follow-ups</p>
        </div>
      </div>

      {/* Dashboard */}

      <div className="mb-8">
        <FollowupDashboard
          overdue={overdueCount}
          today={todayCount}
          upcoming={upcomingCount}
          expectedValue={expectedValue}
        />
      </div>

      {/* Search */}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search customer, shop or mobile..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-5 py-3 outline-none transition-all duration-200 focus:border-blue-500 focus:bg-white"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setFilter("today")}
            className={`rounded-xl px-6 py-3 font-semibold transition-all duration-200 ${
              filter === "today"
                ? "bg-blue-600 text-white shadow-lg"
                : "border border-slate-300 bg-white hover:bg-slate-50"
            }`}
          >
            Today's Follow-ups
          </button>

          <button
            onClick={() => setFilter("overdue")}
            className={`rounded-xl px-6 py-3 font-semibold transition-all duration-200 ${
              filter === "overdue"
                ? "bg-red-600 text-white shadow-lg"
                : "border border-slate-300 bg-white hover:bg-slate-50"
            }`}
          >
            Overdue
          </button>
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl border bg-white p-12 text-center text-slate-500">
          Loading Follow-ups...
        </div>
      ) : (
        <div>
          <div className="space-y-4">
            {filtered.length === 0 ? (
              <div className="rounded-2xl border bg-white p-12 text-center">
                <div className="text-6xl">📭</div>

                <h2 className="mt-4 text-2xl font-bold">No Follow-ups Found</h2>

                <p className="mt-2 text-slate-500">
                  There are no follow-ups matching your search.
                </p>
              </div>
            ) : (
              filtered.map((lead) => (
                <FollowupCard
                  key={lead.id}
                  lead={lead}
                  onUpdated={loadFollowups}
                />
              ))
            )}
          </div>
        </div>
      )}
    </MainLayout>
  );
}
