import { useState } from "react";

import type { Lead } from "../../types/lead";

import LeadTabs from "./LeadTabs";
import LeadAttachments from "./LeadAttachments";
import LeadTimeline from "./LeadTimeline";
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

  const [activeTab, setActiveTab] =
    useState("Details");

  if (!lead) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex">

      <div
        className="flex-1 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="w-[650px] overflow-y-auto bg-white shadow-2xl">

        <div className="sticky top-0 z-20 border-b bg-white">

          <div className="flex items-center justify-between px-6 py-5">

            <div>

              <h2 className="text-2xl font-bold text-slate-800">
                {lead.customerName}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {lead.shopName || "No Shop Name"}
              </p>

            </div>

            <button
              onClick={onClose}
              className="h-10 w-10 rounded-full text-xl text-red-600 hover:bg-red-100"
            >
              ✕
            </button>

          </div>

          <div className="grid grid-cols-3 gap-3 px-6 pb-5">

            <a
              href={`tel:${lead.mobile}`}
              className="rounded-xl bg-blue-600 py-3 text-center font-semibold text-white hover:bg-blue-700"
            >
              📞 Call
            </a>

            <a
              href={`https://wa.me/91${lead.mobile}`}
              target="_blank"
              rel="noreferrer"
              className="rounded-xl bg-green-600 py-3 text-center font-semibold text-white hover:bg-green-700"
            >
              💬 WhatsApp
            </a>

            <button
              className="rounded-xl bg-orange-600 py-3 font-semibold text-white hover:bg-orange-700"
            >
              ✏️ Edit
            </button>

          </div>

          <LeadTabs
            active={activeTab}
            onChange={setActiveTab}
          />

        </div>

        <div className="space-y-6 p-6">

          {activeTab === "Details" && (

            <>
              <h3 className="text-xl font-bold">
                Lead Information
              </h3>

              <div className="grid grid-cols-2 gap-5">

                <Info label="Customer" value={lead.customerName} />
                <Info label="Mobile" value={lead.mobile} />
                <Info label="Shop" value={lead.shopName} />
                <Info label="Email" value={lead.email} />
                <Info label="Status" value={lead.status} />
                <Info label="Priority" value={lead.priority} />
                <Info label="Lead Owner" value={lead.leadOwner} />
                <Info label="Lead Source" value={lead.leadSource} />
                <Info label="State" value={lead.state} />
                <Info label="District" value={lead.district} />
                <Info label="Area" value={lead.area} />
                <Info label="Pincode" value={lead.pincode} />

              </div>

            </>

          )}

          {activeTab === "Notes" && (

            <>
              <h3 className="text-xl font-bold">
                Notes Timeline
              </h3>

              <LeadNotes
                leadId={lead.id!}
              />

            </>

          )}

          {activeTab === "Calls" && (

            <>
              <h3 className="text-xl font-bold">
                Call History
              </h3>

              <LeadCalls
                leadId={lead.id!}
              />

            </>

          )}

          {activeTab === "Attachments" && (

            <LeadAttachments
              lead={lead}
            />

          )}

          {activeTab === "Timeline" && (

            <LeadTimeline
              lead={lead}
            />

          )}

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

    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">

      <p className="mb-1 text-xs uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p className="break-words font-semibold text-slate-800">
        {value || "-"}
      </p>

    </div>

  );

}