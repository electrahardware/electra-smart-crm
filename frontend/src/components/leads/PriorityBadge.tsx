interface Props {
  priority?: string | null;
}

export default function PriorityBadge({
  priority,
}: Props) {
  const value = priority || "Cold";

  let classes =
    "bg-slate-100 text-slate-700";

  switch (value.toLowerCase()) {
    case "hot":
    case "🔥 hot":
      classes =
        "bg-red-100 text-red-700";
      break;

    case "warm":
      classes =
        "bg-orange-100 text-orange-700";
      break;

    case "cold":
      classes =
        "bg-blue-100 text-blue-700";
      break;

    case "No Req.":
  return (
    <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-700">
      ⚪ No Req.
    </span>
  );
  }

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${classes}`}
    >
      {value}
    </span>
  );
}