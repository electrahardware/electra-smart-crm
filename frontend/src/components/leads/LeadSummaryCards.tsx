import { AlertCircle, CalendarDays, CircleDollarSign, Flame, Users } from "lucide-react";

interface Props {
  totalLeads: number;
  hotLeads: number;
  todayFollowups: number;
  expectedValue: number;
  overdueLeads: number;
  upcomingLeads: number;
}

type SummaryIcon = typeof Users;

function SummaryCard({ title, value, icon: Icon }: { title: string; value: string | number; icon: SummaryIcon }) {
  return (
    <div className="premium-stat-card p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium text-zinc-500">{title}</p>
        <span className="premium-icon-tile h-8 w-8 rounded-lg"><Icon size={16} /></span>
      </div>
      <h2 className="mt-3 text-2xl font-bold tracking-[-.04em] text-zinc-900">{value}</h2>
    </div>
  );
}

export default function LeadSummaryCards({ totalLeads, hotLeads, todayFollowups, expectedValue, overdueLeads, upcomingLeads }: Props) {
  return (
    <div className="grid gap-3 border-b border-zinc-100 p-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      <SummaryCard title="Total Leads" value={totalLeads} icon={Users} />
      <SummaryCard title="Hot Leads" value={hotLeads} icon={Flame} />
      <SummaryCard title="Today's Follow-up" value={todayFollowups} icon={CalendarDays} />
      <SummaryCard title="Expected Value" value={`₹ ${expectedValue.toLocaleString()}`} icon={CircleDollarSign} />
      <SummaryCard title="Overdue" value={overdueLeads} icon={AlertCircle} />
      <SummaryCard title="Upcoming" value={upcomingLeads} icon={CalendarDays} />
    </div>
  );
}
