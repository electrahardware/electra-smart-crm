import type { Lead } from "../../types/lead";
import LeadNotes from "./LeadNotes";
import LeadCalls from "./LeadCalls";

interface Props {
  lead: Lead | null;
  onClose: () => void;
}

export default function LeadDetailsDrawer({
  lead,
  onClose,
}: Props) {
  if (!lead) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex">

      <div
        className="flex-1 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="w-[600px] bg-white shadow-2xl overflow-y-auto">

        {/* Header */}

        <div className="sticky top-0 z-20 bg-white border-b px-6 py-5 flex items-center justify-between">

          <div>

            <h2 className="text-2xl font-bold text-slate-800">
              {lead.customerName}
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              {lead.shopName || "No Shop Name"}
            </p>

          </div>

          <button
            onClick={onClose}
            className="h-10 w-10 rounded-full hover:bg-red-100 text-red-600 text-xl"
          >
            ✕
          </button>

        </div>

        {/* Quick Actions */}

        <div className="grid grid-cols-3 gap-3 p-6 border-b">

          <a
            href={`tel:${lead.mobile}`}
            className="rounded-xl bg-blue-600 text-white py-3 text-center font-semibold hover:bg-blue-700"
          >
            📞 Call
          </a>

          <a
            href={`https://wa.me/91${lead.mobile}`}
            target="_blank"
            rel="noreferrer"
            className="rounded-xl bg-green-600 text-white py-3 text-center font-semibold hover:bg-green-700"
          >
            💬 WhatsApp
          </a>

          <button
            className="rounded-xl bg-orange-600 text-white py-3 font-semibold hover:bg-orange-700"
          >
            ✏️ Edit
          </button>

        </div>

        {/* Details */}

        <div className="p-6">

          <h3 className="text-lg font-bold mb-5">
            Lead Information
          </h3>

          <div className="grid grid-cols-2 gap-5">

            <Info
              label="Customer"
              value={lead.customerName}
            />

            <Info
              label="Mobile"
              value={lead.mobile}
            />

            <Info
              label="Shop"
              value={lead.shopName}
            />

            <Info
              label="Email"
              value={lead.email}
            />

            <Info
              label="Status"
              value={lead.status}
            />

            <Info
              label="Priority"
              value={lead.priority}
            />

            <Info
              label="Lead Owner"
              value={lead.leadOwner}
            />

            <Info
              label="Lead Source"
              value={lead.leadSource}
            />

            <Info
              label="State"
              value={lead.state}
            />

            <Info
              label="District"
              value={lead.district}
            />

            <Info
              label="Area"
              value={lead.area}
            />

            <Info
              label="Pincode"
              value={lead.pincode}
            />

          </div>

          <div className="mt-8">

            <h3 className="text-lg font-bold mb-4">
              Notes Timeline
            </h3>

            <LeadNotes
  leadId={lead.id!}
/>

<hr className="my-8" />

<h3 className="text-lg font-bold mb-4">
  Call History
</h3>

<LeadCalls
  leadId={lead.id!}
/>
          </div>

        </div>

      </div>

    </div>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  return (
    <div className="rounded-xl border p-4">

      <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">
        {label}
      </p>

      <p className="font-semibold break-words">
        {value || "-"}
      </p>

    </div>
  );
}