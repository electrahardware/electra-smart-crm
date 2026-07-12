import { useState } from "react";

import type { Lead } from "../../types/lead";

import LeadTabs from "./LeadTabs";
import LeadNotes from "./LeadNotes";
import LeadCalls from "./LeadCalls";
import LeadAttachments from "./LeadAttachments";
import LeadTimeline from "./LeadTimeline";

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

  function getPriorityColor(
  priority?: string
) {

  switch (priority) {

    case "Hot":
      return "bg-red-100 text-red-700";

    case "Warm":
      return "bg-orange-100 text-orange-700";

    case "Cold":
      return "bg-blue-100 text-blue-700";

    default:
      return "bg-slate-100 text-slate-700";

  }

}

  return (

    <div className="fixed inset-0 z-50 flex">

      <div
        className="flex-1 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="flex h-full w-[700px] flex-col overflow-hidden bg-slate-50 shadow-2xl">

        {/* Header */}

        <div className="sticky top-0 z-30 border-b bg-white">

          <div className="flex items-center justify-between px-6 py-5">

            <div className="flex items-center gap-4">

              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-2xl font-bold text-white">

                {lead.customerName
                  ?.charAt(0)
                  .toUpperCase()}

              </div>

              <div>

                <h2 className="text-2xl font-bold text-slate-800">

                  {lead.customerName}

                </h2>

                <p className="mt-1 text-slate-500">

                  {lead.shopName ||
                    "No Shop Name"}

                </p>

                <div className="mt-3 flex flex-wrap gap-2">

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${getPriorityColor(
  lead.priority
)}`}
                  >

                    🔥 {lead.priority || "Normal"}

                  </span>

                  <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">

                    📌 {lead.status || "No Status"}

                  </span>

                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">

                    👤 {lead.leadOwner || "Unassigned"}

                  </span>

                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">

                    📍 {lead.state || "Unknown"}

                  </span>

                </div>

              </div>

            </div>

            <button
              onClick={onClose}
              className="flex h-11 w-11 items-center justify-center rounded-full text-xl text-red-600 transition hover:bg-red-100"
            >

              ✕

            </button>

          </div>

          {/* Quick Actions */}

          <div className="grid grid-cols-4 gap-3 px-6 pb-5">

            <a
              href={`tel:${lead.mobile}`}
              className="rounded-xl bg-blue-600 py-3 text-center font-semibold text-white transition hover:bg-blue-700"
            >
              📞 Call
            </a>

            <a
              href={`https://wa.me/91${lead.mobile}`}
              target="_blank"
              rel="noreferrer"
              className="rounded-xl bg-green-600 py-3 text-center font-semibold text-white transition hover:bg-green-700"
            >
              💬 WhatsApp
            </a>

            <a
              href={`mailto:${lead.email || ""}`}
              className="rounded-xl bg-purple-600 py-3 text-center font-semibold text-white transition hover:bg-purple-700"
            >
              ✉ Email
            </a>

            <button
              className="rounded-xl bg-orange-600 py-3 font-semibold text-white transition hover:bg-orange-700"
            >
              ✏ Edit
            </button>

          </div>

          <LeadTabs
            active={activeTab}
            onChange={setActiveTab}
          />

        </div>

        <div className="flex-1 overflow-y-auto p-6">

                    {activeTab === "Details" && (

            <div className="space-y-6">

              <div className="grid grid-cols-2 gap-5">

                <Info
                  label="👤 Customer Name"
                  value={lead.customerName}
                />

                <Info
                  label="📞 Mobile Number"
                  value={lead.mobile}
                />

                <Info
                  label="💬 WhatsApp"
                  value={
                    lead.whatsapp ||
                    lead.mobile
                  }
                />

                <Info
                  label="🏪 Shop Name"
                  value={lead.shopName}
                />

                <Info
                  label="✉ Email"
                  value={lead.email}
                />

                <Info
                  label="🌐 Website"
                  value={lead.website}
                />

                <Info
                  label="🏷 GST Number"
                  value={lead.gst}
                />

                <Info
                  label="👨 Lead Owner"
                  value={lead.leadOwner}
                />

                <Info
                  label="📌 Lead Status"
                  value={lead.status}
                />

                <Info
                  label="🔥 Priority"
                  value={lead.priority}
                />

                <Info
                  label="📢 Lead Source"
                  value={lead.leadSource}
                />

                <Info
                  label="🗣 Language"
                  value={lead.language}
                />

                <Info
                  label="💰 Expected Value"
                  value={
                    lead.expectedValue
                      ? `₹${lead.expectedValue.toLocaleString()}`
                      : "-"
                  }
                />

                <Info
                  label="📊 Probability"
                  value={
                    lead.probability
                      ? `${lead.probability}%`
                      : "-"
                  }
                />

              </div>

              <div className="rounded-2xl border bg-white p-5 shadow-sm">

                <h3 className="mb-4 text-lg font-bold">

                  📍 Address

                </h3>

                <div className="grid grid-cols-2 gap-4">

                  <Info
                    label="Country"
                    value={lead.country}
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

                  <Info
                    label="Address"
                    value={`${lead.addressLine1 || ""} ${lead.addressLine2 || ""}`}
                  />

                </div>

              </div>

            </div>

          )}

          {activeTab === "Notes" && (

            <LeadNotes
              leadId={lead.id!}
            />

          )}

          {activeTab === "Calls" && (

            <LeadCalls
              leadId={lead.id!}
            />

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

interface InfoProps {

  label: string;

  value?: string | number | null;

}

function Info({

  label,

  value,

}: InfoProps) {

  return (

    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-300 hover:shadow-md">

      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">

        {label}

      </p>

      <div className="break-words text-base font-semibold text-slate-800">

        {value || "-"}

      </div>

    </div>

  );

}