import { useState } from "react";

import type { Lead } from "../../types/lead";
import { EmptyLead } from "../../types/lead";

import { useLead } from "../../hooks/useLead";


import CompleteFollowupDialog from "./CompleteFollowupDialog";
import RescheduleFollowupDialog from "./RescheduleFollowupDialog";



type Props = {
  lead: Lead;
  onUpdated: () => void;
};

import LeadNotesDialog from "./LeadNotesDialog";

export default function FollowupCard({
  lead,
  onUpdated,
}: Props) {

  const [currentLead, setCurrentLead] =
useState(lead);

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

          <p className="mt-1 text-slate-500">
            📞 {lead.mobile}
          </p>

          <p className="mt-1 text-sm text-orange-600 font-medium">
            📅 {lead.followupDate?.slice(0, 10) || "-"}
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
  leadId={lead.id ?? 0}
  lead={lead}
  onClose={() => setNotesOpen(false)}
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
    