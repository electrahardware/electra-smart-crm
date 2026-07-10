import { useEffect, useState } from "react";

import MainLayout from "../layouts/MainLayout";

import TodayFollowups from "../components/dashboard/TodayFollowups";

import RecentActivities from "../components/dashboard/RecentActivities";

import {
  getDashboard,
  type DashboardData,
} from "../services/dashboardService";

export default function Dashboard() {

  const [stats, setStats] =
    useState<DashboardData | null>(null);

  useEffect(() => {

    loadDashboard();

  }, []);

  async function loadDashboard() {

    try {

      const data =
        await getDashboard();

      setStats(data);

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
    },

    {
      title: "Today's Follow-ups",
      value: stats?.todayFollowups ?? 0,
      color: "text-orange-600",
      icon: "📅",
    },

    {
      title: "Hot Leads",
      value: stats?.hotLeads ?? 0,
      color: "text-red-600",
      icon: "🔥",
    },

    {
      title: "Won Leads",
      value: stats?.wonLeads ?? 0,
      color: "text-emerald-600",
      icon: "🏆",
    },

    {
      title: "Lost Leads",
      value: stats?.lostLeads ?? 0,
      color: "text-slate-600",
      icon: "❌",
    },

    {
      title: "Overdue Follow-ups",
      value: stats?.overdueFollowups ?? 0,
      color: "text-rose-600",
      icon: "⏰",
    },

    {
      title: "Pipeline Value",
      value: `₹${(
        stats?.pipelineValue ?? 0
      ).toLocaleString()}`,
      color: "text-green-600",
      icon: "💰",
    },

  ];

  return (

    <MainLayout>

      <div className="mb-8">

        <h1 className="text-3xl font-bold text-slate-800">
          Dashboard
        </h1>

        <p className="mt-2 text-slate-500">
          Welcome to Electra Smart CRM
        </p>

      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

        {cards.map((card) => (

          <div
            key={card.title}
            className="rounded-2xl border bg-white p-6 shadow-sm transition hover:shadow-lg"
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

          </div>

        ))}

      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">

        <div className="rounded-2xl border bg-white p-6 shadow-sm">

          <h2 className="text-xl font-bold">
            📈 Sales Overview
          </h2>

          <div className="mt-8 flex h-72 items-center justify-center rounded-xl border-2 border-dashed border-slate-300">

            Sales Chart Coming Soon

          </div>

        </div>

        <TodayFollowups />

        <RecentActivities />

      </div>

    </MainLayout>

  );

}