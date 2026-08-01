import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";

import {
  getAnalytics,
  type AnalyticsResponse,
} from "../services/analyticsService";

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsResponse | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const res = await getAnalytics();

      setData(res);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="rounded-2xl bg-white p-10 text-center shadow">
          <p className="text-lg text-slate-500">Loading Analytics...</p>
        </div>
      </MainLayout>
    );
  }

  if (!data) {
    return (
      <MainLayout>
        <div className="rounded-2xl bg-white p-10 text-center shadow">
          <p className="text-red-500">Unable to load analytics.</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {/* Header */}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">
          Analytics Dashboard
        </h1>

        <p className="mt-2 text-slate-500">Live overview of CRM performance</p>
      </div>

      {/* KPI Cards */}

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <Card
          title="Total Leads"
          value={data.totalLeads}
          color="text-blue-600"
        />

        <Card
          title="Today's Leads"
          value={data.newToday}
          color="text-green-600"
        />

        <Card
          title="This Week"
          value={data.weekLeads}
          color="text-purple-600"
        />

        <Card
          title="This Month"
          value={data.monthLeads}
          color="text-orange-600"
        />
      </div>

      {/* Second Row */}

      <div className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <Card title="Hot Leads" value={data.hotLeads} color="text-red-600" />

        <Card
          title="Warm Leads"
          value={data.warmLeads}
          color="text-amber-600"
        />

        <Card title="Cold Leads" value={data.coldLeads} color="text-cyan-600" />

        <Card
          title="No Requirement"
          value={data.noReqLeads}
          color="text-slate-600"
        />
      </div>

      {/* Third Row */}

      <div className="mt-6 grid gap-6 sm:grid-cols-3">
        <Card
          title="Today's Follow-ups"
          value={data.todayFollowups}
          color="text-indigo-600"
        />

        <Card
          title="Completed Today"
          value={data.completedToday}
          color="text-emerald-600"
        />

        <Card title="Overdue" value={data.overdue} color="text-rose-600" />
      </div>

      {/* Charts Section */}

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Top Cities */}

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-xl font-bold">🏙 Top Cities</h2>

          <div className="space-y-4">
            {data.cityWise.map((item) => {
              const max = data.cityWise[0]?._count.city || 1;

              const width = (item._count.city / max) * 100;

              return (
                <div key={item.city ?? "Unknown"}>
                  <div className="mb-1 flex justify-between">
                    <span>{item.city || "Unknown"}</span>

                    <span className="font-semibold">{item._count.city}</span>
                  </div>

                  <div className="h-3 rounded-full bg-slate-200">
                    <div
                      className="h-3 rounded-full bg-blue-600"
                      style={{
                        width: `${width}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top States */}

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-xl font-bold">🌍 States</h2>

          <div className="space-y-4">
            {data.stateWise.map((item) => {
              const max = data.stateWise[0]?._count.state || 1;

              const width = (item._count.state / max) * 100;

              return (
                <div key={item.state ?? "Unknown"}>
                  <div className="mb-1 flex justify-between">
                    <span>{item.state || "Unknown"}</span>

                    <span className="font-semibold">{item._count.state}</span>
                  </div>

                  <div className="h-3 rounded-full bg-slate-200">
                    <div
                      className="h-3 rounded-full bg-green-600"
                      style={{
                        width: `${width}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Owner Performance */}

      <div className="mt-8 rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="mb-6 text-xl font-bold">👨‍💼 Lead Owner Performance</h2>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {data.ownerWise.map((item) => (
            <div
              key={item.leadOwner ?? "Unknown"}
              className="rounded-xl border bg-slate-50 p-5"
            >
              <p className="text-slate-500">{item.leadOwner || "Unknown"}</p>

              <h3 className="mt-3 text-4xl font-bold text-blue-600">
                {item._count.leadOwner}
              </h3>

              <p className="mt-2 text-sm text-slate-400">Assigned Leads</p>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Section */}

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* Lead Sources */}

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-xl font-bold">📌 Lead Sources</h2>

          <div className="space-y-3">
            {data.sourceWise.map((item) => (
              <div
                key={item.leadSource ?? "Unknown"}
                className="flex items-center justify-between rounded-lg border-b pb-2"
              >
                <span>{item.leadSource || "Unknown"}</span>

                <span className="font-bold text-blue-600">
                  {item._count.leadSource}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Lead Status */}

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-xl font-bold">📊 Lead Status</h2>

          <div className="space-y-3">
            {data.statusWise.map((item) => (
              <div
                key={item.status ?? "Unknown"}
                className="flex items-center justify-between rounded-lg border-b pb-2"
              >
                <span>{item.status || "Unknown"}</span>

                <span className="font-bold text-green-600">
                  {item._count.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Priority */}

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-xl font-bold">⭐ Priority</h2>

          <div className="space-y-3">
            {data.priorityWise.map((item) => (
              <div
                key={item.priority ?? "Unknown"}
                className="flex items-center justify-between rounded-lg border-b pb-2"
              >
                <span>{item.priority || "Unknown"}</span>

                <span className="font-bold text-red-600">
                  {item._count.priority}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

interface CardProps {
  title: string;
  value: number;
  color: string;
}

function Card({ title, value, color }: CardProps) {
  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <p className="text-sm text-slate-500">{title}</p>

      <h2 className={`mt-3 text-4xl font-bold ${color}`}>{value}</h2>

      <p className="mt-4 text-xs text-slate-400">Live CRM Data</p>
    </div>
  );
}
