import { AlertTriangle, CalendarDays, CircleDollarSign, Clock3 } from "lucide-react";

interface Props { overdue: number; today: number; upcoming: number; expectedValue: number; }
type CardIcon = typeof AlertTriangle;

function Card({ title, value, icon: Icon }: { title: string; value: string | number; icon: CardIcon }) {
  return (
    <div className="premium-stat-card p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-zinc-500">{title}</p>
        <span className="premium-icon-tile"><Icon size={19} /></span>
      </div>
      <h2 className="mt-4 text-3xl font-bold tracking-[-.045em] text-zinc-900">{value}</h2>
    </div>
  );
}

export default function FollowupDashboard({ overdue, today, upcoming, expectedValue }: Props) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      <Card title="Overdue" value={overdue} icon={AlertTriangle} />
      <Card title="Today" value={today} icon={CalendarDays} />
      <Card title="Upcoming" value={upcoming} icon={Clock3} />
      <Card title="Expected Value" value={`₹ ${expectedValue.toLocaleString()}`} icon={CircleDollarSign} />
    </div>
  );
}
