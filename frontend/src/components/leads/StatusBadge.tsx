interface Props {
  status?: string | null;
}

export default function StatusBadge({
  status,
}: Props) {
  const value = status || "New";

  let classes =
    "bg-slate-100 text-slate-700";

  switch (value.toLowerCase()) {
    case "new":
      classes =
        "bg-blue-100 text-blue-700";
      break;

    case "negotiation":
      classes =
        "bg-yellow-100 text-yellow-700";
      break;

    case "won":
      classes =
        "bg-green-100 text-green-700";
      break;

    case "lost":
      classes =
        "bg-red-100 text-red-700";
      break;
  }

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${classes}`}
    >
      {value}
    </span>
  );
}