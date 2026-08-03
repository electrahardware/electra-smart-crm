import { useEffect, useState } from "react";

import type { Lead } from "../../types/lead";
import { EmptyLead } from "../../types/lead";

import { useLead } from "../../hooks/useLead";
import { formatDate } from "../../utils/date";

import CompleteFollowupDialog from "./CompleteFollowupDialog";
import RescheduleFollowupDialog from "./RescheduleFollowupDialog";



type Props = {
  lead: Lead;
  onUpdated: () => void;
};

import LeadNotesDialog from "./LeadNotesDialog";
import LeadStatusQuickUpdate from "./LeadStatusQuickUpdate";

export default function FollowupCard({
  lead,
  onUpdated,
}: Props) {

  const [currentLead, setCurrentLead] =
useState(lead);

useEffect(() => {
  setCurrentLead(lead);
}, [lead]);

  const {
  setLead,
  setEditingId,
  setWizardOpen,
} = useLead();

  const [loading, setLoading] =
    useState(false);

  const [notesOpen, setNotesOpen] =
  useState(false);

  const [completeOpen, setCompleteOpen] = useState(false);

const [rescheduleOpen, setRescheduleOpen] = useState(false);

  function handleEdit() {

  setEditingId(lead.id!);

  setLead({
    ...EmptyLead,
    ...lead,
  });

  setWizardOpen(true);

}

  function handleDone() {
  setCompleteOpen(true);
}

  function handleReschedule() {
  setRescheduleOpen(true);
}

  return (

    <>

<div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">

      <div className="flex items-start justify-between">

        <div>

          <h3 className="text-lg font-bold text-slate-800">
  {lead.shopName || "-"}
</h3>

<p className="mt-2 text-slate-600">
  👤 {lead.customerName}
</p>

{/* Priority + Lead Owner */}
<div className="mt-3 flex flex-wrap gap-2">

  {lead.priority && (
    <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
      🔥 {lead.priority}
    </span>
  )}

  {lead.leadOwner && (
    <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
      👨 {lead.leadOwner}
    </span>
  )}

</div>

<p className="mt-3 text-slate-500">
  📞 {lead.mobile}
</p>

<p className="mt-1 text-sm font-medium text-orange-600">
  📅 {lead.followupDate
      ? formatDate(lead.followupDate)
      : "-"}
</p>

        </div>

        <div className="flex flex-wrap gap-2">

                  <a
            href={`tel:${lead.mobile}`}
            className="rounded-xl bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700"
          >
            📞 Call
          </a>

          <a
            href={`https://wa.me/91${lead.mobile}`}
            target="_blank"
            rel="noreferrer"
            className="rounded-xl bg-green-600 px-4 py-2 text-white transition hover:bg-green-700"
          >
            💬 WhatsApp
          </a>

          <button
            onClick={handleEdit}
            className="rounded-xl bg-amber-500 px-4 py-2 text-white transition hover:bg-amber-600"
          >
            ✏ Edit
          </button>

          <button
  onClick={() => setNotesOpen(true)}
  className="rounded-xl bg-indigo-600 px-4 py-2 text-white transition hover:bg-indigo-700"
>
  📝 Notes
</button>

          <button
            onClick={handleReschedule}
            disabled={loading}
            className="rounded-xl bg-orange-600 px-4 py-2 text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            📅 Reschedule
          </button>

          <LeadStatusQuickUpdate
            leadId={currentLead.id ?? 0}
            currentStatus={currentLead.status}
            compact
            onUpdated={(updated) => {
              setCurrentLead((previous) => ({ ...previous, status: updated.status, lastEditedAt: updated.lastEditedAt }));
              onUpdated();
            }}
          />

          <button
  onClick={handleDone}
            disabled={loading}
            className="rounded-xl bg-emerald-600 px-4 py-2 text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "Saving..."
              : "✅ Done"}
          </button>

        </div>

      </div>

    </div>

    <LeadNotesDialog
  open={notesOpen}
  leadId={currentLead.id ?? 0}
  lead={currentLead}
  onClose={() => setNotesOpen(false)}
  onLeadUpdated={setCurrentLead}
/>

<CompleteFollowupDialog
  open={completeOpen}
  lead={currentLead}
  onClose={() => setCompleteOpen(false)}
  onCompleted={onUpdated}
/>

<RescheduleFollowupDialog
  open={rescheduleOpen}
  lead={currentLead}
  onClose={() => setRescheduleOpen(false)}
  onUpdated={onUpdated}
  onLeadUpdated={setCurrentLead}
/>



</>

  );

}  
    
