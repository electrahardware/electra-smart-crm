import StatusBadge from "./StatusBadge";
import PriorityBadge from "./PriorityBadge";
import type { Lead } from "../../types/lead";
import {
  Phone,
  MessageCircle,
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";

interface Props {
  lead: Lead;

  index: number;

  selected: boolean;

  onToggle: () => void;

  onView: () => void;

  onEdit: () => void;

  onDelete: () => void;
  
}

export default function LeadRow({
  lead,
  index,
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

    <tr
  onClick={onView}
  className={`group border-t cursor-pointer transition-all duration-200
    ${
      index % 2 === 0
  ? "bg-white"
  : "bg-slate-100"
    }
    hover:bg-sky-50 hover:shadow-sm`}
>

      <td className="p-3">
        <input
  type="checkbox"
  checked={selected}
  onClick={(e) => e.stopPropagation()}
  onChange={onToggle}
/>
      </td>

      <td className="p-3 whitespace-nowrap">
        {leadDate}
      </td>

      <td className="p-3 font-semibold text-slate-800">
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

        <div className="flex items-center gap-2 opacity-70 transition-all group-hover:opacity-100">

          <a
  href={`tel:${lead.mobile}`}
  onClick={(e) => e.stopPropagation()}
            className="rounded-lg p-2 transition-colors hover:bg-blue-100"
            title="Call"
          >
            <Phone size={18} />
          </a>

          <a
  href={`https://wa.me/91${lead.mobile}`}
  onClick={(e) => e.stopPropagation()}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg p-2 transition-colors hover:bg-green-100"
            title="WhatsApp"
          >
            <MessageCircle size={18} />
          </a>

          <button
  onClick={(e) => {
    e.stopPropagation();
    onView();
  }}
  className="rounded-lg p-2 transition-colors hover:bg-slate-100"
  title="View"
>
  <Eye size={18} />
</button>

          <button
  onClick={(e) => {
    e.stopPropagation();
    onEdit();
  }}
  className="rounded-lg p-2 transition-colors hover:bg-orange-100"
  title="Edit"
>
  <Pencil size={18} />
</button>

          <button
  onClick={(e) => {
    e.stopPropagation();
    onDelete();
  }}
  className="rounded-lg p-2 text-red-600 transition-colors hover:bg-red-100"
  title="Delete"
>
  <Trash2 size={18} />
</button>

        </div>

      </td>

    </tr>

  );

}