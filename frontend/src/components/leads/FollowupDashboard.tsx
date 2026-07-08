interface Props {
  overdue: number;
  today: number;
  upcoming: number;
  expectedValue: number;
}

function Card({
  title,
  value,
  color,
}: {
  title: string;
  value: string | number;
  color: string;
}) {
  return (
    <div
      className={`rounded-2xl border p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${color}`}
    >
      <p className="text-sm opacity-70">
        {title}
      </p>

      <h2 className="mt-2 text-4xl font-bold">
        {value}
      </h2>
    </div>
  );
}

export default function FollowupDashboard({
  overdue,
  today,
  upcoming,
  expectedValue,
}: Props) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">

      <Card
        title="🔴 Overdue"
        value={overdue}
        color="bg-red-50 border-red-200 text-red-700"
      />

      <Card
        title="🟢 Today"
        value={today}
        color="bg-green-50 border-green-200 text-green-700"
      />

      <Card
        title="🔵 Upcoming"
        value={upcoming}
        color="bg-cyan-50 border-cyan-200 text-cyan-700"
      />

      <Card
        title="💰 Expected Value"
        value={`₹ ${expectedValue.toLocaleString()}`}
        color="bg-yellow-50 border-yellow-200 text-yellow-700"
      />

    </div>
  );
}