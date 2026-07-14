import StatusBadge from "./StatusBadge";
import PriorityBadge from "./PriorityBadge";
import type { Lead } from "../../types/lead";

interface Props {
  lead: Lead;

  selected: boolean;

  onToggle: () => void;

  onView: () => void;

  onEdit: () => void;

  onDelete: () => void;
}

export default function LeadRow({
  lead,
  selected,
  onToggle,
  onView,
  onEdit,
  onDelete,
}: Props) {

  const rawDate =
    lead.leadDate ||
    lead.createdAt ||
    "";

  const leadDate = rawDate
    ? new Intl.DateTimeFormat("en-GB")
        .format(new Date(rawDate))
        .replace(/\//g, "-")
    : "-";

  return (

    <tr className="border-t hover:bg-slate-50">

      <td className="p-3">
        <input
          type="checkbox"
          checked={selected}
          onChange={onToggle}
        />
      </td>

      <td className="p-3 whitespace-nowrap">
        {leadDate}
      </td>

      <td className="p-3 font-medium">
        {lead.customerName}
      </td>

      <td className="p-3">
        {lead.mobile}
      </td>

      <td className="p-3">
        {lead.shopName || "-"}
      </td>

      <td className="p-3">
        {lead.city || "-"}
      </td>

      <td className="p-3">
        {lead.leadOwner || "-"}
      </td>

      <td className="p-3">
        <StatusBadge
          status={lead.status}
        />
      </td>

      <td className="p-3">
        <PriorityBadge
          priority={lead.priority}
        />
      </td>

      <td className="p-3">

        <div className="flex items-center gap-2">

          <a
            href={`tel:${lead.mobile}`}
            className="rounded-lg p-2 hover:bg-pink-100"
            title="Call"
          >
            📞
          </a>

          <a
            href={`https://wa.me/91${lead.mobile}`}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg p-2 hover:bg-green-100"
            title="WhatsApp"
          >
            💬
          </a>

          <button
            onClick={onView}
            className="rounded-lg p-2 hover:bg-slate-100"
            title="View"
          >
            👁️
          </button>

          <button
            onClick={onEdit}
            className="rounded-lg p-2 hover:bg-orange-100"
            title="Edit"
          >
            ✏️
          </button>

          <button
            onClick={onDelete}
            className="rounded-lg p-2 text-red-600 hover:bg-red-100"
            title="Delete"
          >
            🗑️
          </button>

        </div>

      </td>

    </tr>

  );

}