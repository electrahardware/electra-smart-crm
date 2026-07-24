import {
  Phone,
  MessageCircle,
  MapPin,
  Building2,
  User,
  Pencil,
} from "lucide-react";

type Props = {
  lead: {
    customerName?: string;
    mobile?: string;
    shopName?: string;
    city?: string;
    state?: string;
    leadOwner?: string;
  } | null;
  loading?: boolean;
};

export default function MasterLeadHeader({
  lead,
  loading = false,
}: Props) {
  if (loading) {
    return (
      <div className="border-b bg-slate-50 px-6 py-5">
        <p className="text-slate-500">Loading Lead...</p>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="border-b bg-slate-50 px-6 py-5">
        <p className="text-slate-500">No Lead Selected</p>
      </div>
    );
  }

  return (
    <div className="border-b bg-slate-50 px-6 py-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {lead.customerName || "-"}
          </h1>

          <div className="mt-3 flex flex-wrap gap-5 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <Phone size={16} />
              <span>{lead.mobile || "-"}</span>
            </div>

            <div className="flex items-center gap-2">
              <Building2 size={16} />
              <span>{lead.shopName || "-"}</span>
            </div>

            <div className="flex items-center gap-2">
              <MapPin size={16} />
              <span>
                {[lead.city, lead.state].filter(Boolean).join(", ") || "-"}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <User size={16} />
              <span>{lead.leadOwner || "Unassigned"}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            className="rounded-lg bg-green-600 px-4 py-2 text-white transition hover:bg-green-700"
            title="Call"
          >
            <Phone size={18} />
          </button>

          <button
            className="rounded-lg bg-emerald-600 px-4 py-2 text-white transition hover:bg-emerald-700"
            title="WhatsApp"
          >
            <MessageCircle size={18} />
          </button>

          <button
            className="rounded-lg border px-4 py-2 transition hover:bg-slate-100"
            title="Edit"
          >
            <Pencil size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}