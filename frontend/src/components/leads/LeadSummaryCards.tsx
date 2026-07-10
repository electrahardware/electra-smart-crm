interface Props {
  totalLeads: number;
  hotLeads: number;
  todayFollowups: number;
  expectedValue: number;
  overdueLeads: number;
  upcomingLeads: number;
}

export default function LeadSummaryCards({
  totalLeads,
  hotLeads,
  todayFollowups,
  expectedValue,
  overdueLeads,
  upcomingLeads,
}: Props) {
  return (
    <div className="grid grid-cols-6 gap-4 border-b p-6">

      <SummaryCard
        title="Total Leads"
        value={totalLeads}
        color="blue"
      />

      <SummaryCard
        title="Hot Leads"
        value={hotLeads}
        color="red"
      />

      <SummaryCard
        title="Today's Follow-up"
        value={todayFollowups}
        color="green"
      />

      <SummaryCard
        title="Expected Value"
        value={`₹ ${expectedValue.toLocaleString()}`}
        color="yellow"
      />

      <SummaryCard
        title="Overdue"
        value={overdueLeads}
        color="orange"
      />

      <SummaryCard
        title="Upcoming"
        value={upcomingLeads}
        color="cyan"
      />

    </div>
  );
}

interface SummaryCardProps {
  title: string;
  value: string | number;
  color:
    | "blue"
    | "red"
    | "green"
    | "yellow"
    | "orange"
    | "cyan";
}

function SummaryCard({
  title,
  value,
  color,
}: SummaryCardProps) {

  const colors = {
    blue:
      "bg-blue-50 border-blue-200 text-blue-700",

    red:
      "bg-red-50 border-red-200 text-red-700",

    green:
      "bg-green-50 border-green-200 text-green-700",

    yellow:
      "bg-yellow-50 border-yellow-200 text-yellow-700",

    orange:
      "bg-orange-50 border-orange-200 text-orange-700",

    cyan:
      "bg-cyan-50 border-cyan-200 text-cyan-700",
  };

  return (
    <div
      className={`rounded-xl border p-5 ${colors[color]}`}
    >
      <p className="text-sm opacity-70">
        {title}
      </p>

      <h2 className="mt-2 text-3xl font-bold">
        {value}
      </h2>
    </div>
  );
}