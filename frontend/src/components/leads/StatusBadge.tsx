import { normalizeLeadStatus, STATUS_COLORS } from "../../constants/statusConfig";
interface Props {
  status?: string | null;
}

export default function StatusBadge({
  status,
}: Props) {
  const value = normalizeLeadStatus(status);
  const classes = STATUS_COLORS[value];

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${classes}`}
    >
      {value}
    </span>
  );
}
