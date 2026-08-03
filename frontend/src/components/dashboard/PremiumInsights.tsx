import { Activity, ArrowDownRight, ArrowUpRight, CalendarCheck2, CircleDollarSign, Clock3, Funnel, PhoneCall, PieChart, TrendingUp, Users } from "lucide-react";
import type { DashboardData } from "../../services/dashboardService";
import type { AnalyticsResponse } from "../../services/analyticsService";

const colors = ["#e31e24", "#27272a", "#71717a", "#f87171", "#a1a1aa", "#fecaca"];
type InsightIcon = typeof Users;

function KpiCard({ title, value, icon: Icon, note, alert = false }: { title: string; value: string | number; icon: InsightIcon; note: string; alert?: boolean }) {
  return <article className="premium-stat-card group min-w-0 p-4 sm:p-5">
    <div className="flex items-start justify-between gap-3"><p className="text-sm font-medium text-zinc-500">{title}</p><span className="premium-icon-tile transition group-hover:scale-105"><Icon size={19} /></span></div>
    <p className="mt-4 truncate text-3xl font-bold tracking-[-.05em] text-zinc-900">{value}</p>
    <p className={`mt-3 flex items-center gap-1 text-xs font-medium ${alert ? "text-[#e31e24]" : "text-emerald-600"}`}>{alert ? <ArrowDownRight size={14} /> : <ArrowUpRight size={14} />}{note}</p>
  </article>;
}

type ChartItem = { name: string; value: number };
function Bars({ items }: { items: ChartItem[] }) {
  const max = Math.max(...items.map((item) => item.value), 1);
  return <div className="space-y-3.5">{items.slice(0, 6).map((item, index) => <div key={item.name}><div className="mb-1.5 flex justify-between gap-3 text-sm"><span className="truncate text-zinc-600">{item.name}</span><b className="text-zinc-900">{item.value}</b></div><div className="h-2 overflow-hidden rounded-full bg-zinc-100"><div className="h-full rounded-full" style={{ width: `${(item.value / max) * 100}%`, backgroundColor: colors[index % colors.length] }} /></div></div>)}</div>;
}

function Trend({ rows }: { rows: { month: string; count: number }[] }) {
  const data = rows.slice(-8); const max = Math.max(...data.map((item) => item.count), 1);
  const points = data.map((item, index) => `${index * (100 / Math.max(data.length - 1, 1))},${90 - (item.count / max) * 70}`).join(" ");
  return <div><div className="h-40 rounded-xl border border-zinc-100 bg-gradient-to-b from-red-50/50 to-white p-3"><svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none"><line x1="0" x2="100" y1="90" y2="90" stroke="#e4e4e7" strokeWidth=".7"/><line x1="0" x2="100" y1="55" y2="55" stroke="#f4f4f5" strokeWidth=".7"/><polyline points={points} fill="none" stroke="#e31e24" strokeWidth="2.5" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round"/></svg></div><div className="mt-2 flex justify-between gap-1 text-[10px] text-zinc-400">{data.map((item) => <span className="truncate" key={item.month}>{item.month}</span>)}</div></div>;
}

function Donut({ items }: { items: ChartItem[] }) {
  const total = items.reduce((sum, item) => sum + item.value, 0) || 1; let point = 0;
  const gradient = items.slice(0, 6).map((item, index) => { const start = point / total * 100; point += item.value; return `${colors[index]} ${start}% ${point / total * 100}%`; }).join(", ");
  return <div className="flex items-center gap-5"><div className="relative grid h-32 w-32 shrink-0 place-items-center rounded-full" style={{ background: `conic-gradient(${gradient || "#e4e4e7 0 100%"})` }}><div className="grid h-[5.25rem] w-[5.25rem] place-items-center rounded-full bg-white text-center"><b className="text-2xl tracking-[-.04em]">{total}</b><span className="text-[10px] uppercase tracking-wider text-zinc-500">Leads</span></div></div><div className="min-w-0 space-y-2">{items.slice(0, 4).map((item, index) => <div className="flex items-center justify-between gap-4 text-xs" key={item.name}><span className="flex min-w-0 items-center gap-2 text-zinc-600"><i className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: colors[index] }} /><span className="truncate">{item.name}</span></span><b>{item.value}</b></div>)}</div></div>;
}

export default function PremiumInsights({ dashboard, analytics }: { dashboard: DashboardData | null; analytics: AnalyticsResponse | null }) {
  const source = (analytics?.sourceWise ?? []).map((item) => ({ name: item.leadSource || "Unknown", value: item._count.leadSource }));
  const owners = (analytics?.ownerWise ?? []).map((item) => ({ name: item.leadOwner || "Unassigned", value: item._count.leadOwner }));
  const statuses = (analytics?.statusWise ?? []).map((item) => ({ name: item.status || "None", value: item._count.status }));
  const converted = statuses.find((item) => item.name === "Customer")?.value ?? 0;
  const conversion = dashboard?.totalLeads ? Math.round(converted / dashboard.totalLeads * 100) : 0;
  const pending = (analytics?.todayFollowups ?? 0) + (analytics?.overdue ?? 0);
  const growth = analytics?.yesterdayLeads ? Math.round(((analytics.newToday - analytics.yesterdayLeads) / analytics.yesterdayLeads) * 100) : 0;
  return <section className="mb-10"><div className="mb-5 flex items-end justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[.18em] text-[#e31e24]">Performance center</p><h2 className="mt-1 text-2xl font-bold tracking-[-.035em]">Sales at a glance</h2></div><p className="hidden text-sm text-zinc-500 sm:block">Live data from your CRM</p></div>
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
      <KpiCard title="Total Leads" value={dashboard?.totalLeads ?? 0} icon={Users} note={`${analytics?.newToday ?? 0} added today`} />
      <KpiCard title="Today's Calls" value={analytics?.completedToday ?? 0} icon={PhoneCall} note="Completed follow-ups" />
      <KpiCard title="Pending Followups" value={pending} icon={Clock3} note="Needs attention" alert />
      <KpiCard title="Today's Followups" value={analytics?.todayFollowups ?? 0} icon={CalendarCheck2} note="Scheduled today" />
      <KpiCard title="Overdue" value={analytics?.overdue ?? 0} icon={Activity} note="Follow up now" alert />
      <KpiCard title="Upcoming" value={Math.max((analytics?.weekLeads ?? 0) - (analytics?.newToday ?? 0), 0)} icon={TrendingUp} note="This week's flow" />
      <KpiCard title="Conversion" value={`${conversion}%`} icon={Funnel} note={`${converted} customer leads`} />
      <KpiCard title="Revenue" value={`₹${Number(dashboard?.pipelineValue ?? 0).toLocaleString()}`} icon={CircleDollarSign} note="Pipeline value" />
      <KpiCard title="Monthly Growth" value={`${growth >= 0 ? "+" : ""}${growth}%`} icon={TrendingUp} note="vs yesterday" alert={growth < 0} />
    </div>
    <div className="mt-5 grid gap-5 xl:grid-cols-12"><article className="premium-surface p-5 xl:col-span-7"><div className="mb-5 flex items-center justify-between"><div><h3 className="font-bold">Monthly Lead Trend</h3><p className="mt-1 text-sm text-zinc-500">Monthly performance area view</p></div><span className="premium-icon-tile"><TrendingUp size={18}/></span></div><Trend rows={analytics?.monthlyLeads ?? []}/></article><article className="premium-surface p-5 xl:col-span-5"><div className="mb-5 flex items-center justify-between"><div><h3 className="font-bold">Lead Status Distribution</h3><p className="mt-1 text-sm text-zinc-500">Current sales pipeline mix</p></div><span className="premium-icon-tile"><PieChart size={18}/></span></div><Donut items={statuses}/></article><article className="premium-surface p-5 xl:col-span-5"><h3 className="font-bold">Lead Source</h3><p className="mb-5 mt-1 text-sm text-zinc-500">Opportunity origin</p><Bars items={source}/></article><article className="premium-surface p-5 xl:col-span-7"><h3 className="font-bold">Owner Performance</h3><p className="mb-5 mt-1 text-sm text-zinc-500">Assigned lead volume</p><Bars items={owners}/></article></div>
    <div className="mt-5 grid gap-5 lg:grid-cols-2"><article className="premium-surface p-5"><h3 className="mb-1 font-bold">Sales Funnel</h3><p className="mb-5 text-sm text-zinc-500">Lead stage distribution</p><Bars items={statuses}/></article><article className="premium-surface p-5"><h3 className="mb-1 font-bold">Monthly Performance</h3><p className="mb-5 text-sm text-zinc-500">Lead volume over time</p><Trend rows={analytics?.monthlyLeads ?? []}/></article></div>
  </section>;
}
