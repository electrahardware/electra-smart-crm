import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";

import TodayFollowups from "../components/dashboard/TodayFollowups";

import RecentActivities from "../components/dashboard/RecentActivities";

import {
  getDashboard,
  type DashboardData,
} from "../services/dashboardService";
import { getAnalytics, type AnalyticsResponse } from "../services/analyticsService";
import PremiumInsights from "../components/dashboard/PremiumInsights";

export default function Dashboard() {

  const navigate = useNavigate();

  const [stats, setStats] =
    useState<DashboardData | null>(null);

  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);

  useEffect(() => {

    loadDashboard();

  }, []);

  async function loadDashboard() {

    try {

      const [dashboardData, analyticsData] = await Promise.all([getDashboard(), getAnalytics()]);

      setStats(dashboardData);
      setAnalytics(analyticsData);

    } catch (error) {

      console.error(error);

    }

  }

  const cards = [

    {
  title: "Total Leads",
  value: stats?.totalLeads ?? 0,
  color: "text-blue-600",
  icon: "👥",
  onClick: () => navigate("/leads"),
},

    {
      title: "Today's Follow-ups",
      value: stats?.todayFollowups ?? 0,
      color: "text-orange-600",
      icon: "📅",
      onClick: () => navigate("/followups"),
    },

    {
      title: "Hot Leads",
      value: stats?.hotLeads ?? 0,
      color: "text-red-600",
      icon: "🔥",
      onClick: () => navigate("/leads?priority=Hot"),
    },

    {
      title: "Closed Won Leads",
      value: stats?.wonLeads ?? 0,
      color: "text-emerald-600",
      icon: "🏆",
      onClick: () => navigate("/leads?status=Closed Won"),
    },

    {
      title: "Closed Lost Leads",
      value: stats?.lostLeads ?? 0,
      color: "text-slate-600",
      icon: "❌",
      onClick: () => navigate("/leads?status=Closed Lost"),
    },

    {
      title: "Overdue Follow-ups",
      value: stats?.overdueFollowups ?? 0,
      color: "text-rose-600",
      icon: "⏰",
      onClick: () => navigate("/followups?filter=overdue"),
    },

    {
      title: "Pipeline Value",
      value: `₹${(
        stats?.pipelineValue ?? 0
      ).toLocaleString()}`,
      color: "text-green-600",
      icon: "💰",
      onClick: () => navigate("/leads"),
    },

  ];

  return (

    <MainLayout>

      <div className="mb-8">

        <h1 className="premium-page-title text-3xl font-bold sm:text-4xl">
          Dashboard
        </h1>

        <p className="premium-muted mt-2">
          Welcome to Electra Smart CRM
        </p>

      </div>

      <PremiumInsights dashboard={stats} analytics={analytics} />

      <section className="border-t border-zinc-200 pt-8">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-[-.025em]">Operational activity</h2>
          <p className="mt-1 text-sm text-zinc-500">Existing live dashboard widgets</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">

        {cards.map((card) => (

          <button
  type="button"
  key={card.title}
  onClick={card.onClick}
  className="premium-surface cursor-pointer p-5 text-left transition duration-300 hover:-translate-y-1 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-red-500/15"
>

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm text-slate-500">
                  {card.title}
                </p>

                <h2
                  className={`mt-3 text-4xl font-bold ${card.color}`}
                >
                  {card.value}
                </h2>

              </div>

              <div className="text-5xl">
                {card.icon}
              </div>

            </div>

            <p className="mt-4 text-xs font-semibold text-[#e31e24]">
  View Details →
</p>

          </button>

        ))}

      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-2">

        <div className="premium-surface p-6">

          <h2 className="text-xl font-bold">
            📈 Sales Overview
          </h2>

          <div className="mt-8 flex h-72 items-center justify-center rounded-xl border-2 border-dashed border-slate-300">

            Sales Chart Coming Soon

          </div>

        </div>

        <div className="premium-surface p-6">

  <h2 className="mb-5 text-xl font-bold">
    🆕 Recent Leads
  </h2>

  {stats?.recentLeads?.length ? (

    <div className="overflow-x-auto">

      <table className="min-w-full text-sm">

        <thead>

          <tr className="border-b bg-slate-50">

            <th className="px-4 py-3 text-left">
              Customer
            </th>

            <th className="px-4 py-3 text-left">
              Shop
            </th>

            <th className="px-4 py-3 text-left">
              Mobile
            </th>

            <th className="px-4 py-3 text-left">
              Status
            </th>

          </tr>

        </thead>

        <tbody>

          {stats.recentLeads.map((lead) => (

            <tr
  key={lead.id}
  onClick={() => navigate(`/leads/${lead.id}`)}
  className="cursor-pointer border-b transition hover:bg-blue-50"
>

              <td className="px-4 py-3 font-medium text-blue-600">
  {lead.customerName}
</td>

              <td className="px-4 py-3">
                {lead.shopName || "-"}
              </td>

              <td className="px-4 py-3">
                {lead.mobile}
              </td>

              <td className="px-4 py-3">
                {lead.status || "-"}
              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>

  ) : (

    <div className="flex h-56 items-center justify-center text-slate-500">

      📭 No Leads Yet

    </div>

  )}

</div>

        <TodayFollowups />

        <RecentActivities />

      </div>

      </section>

    </MainLayout>

  );

}
