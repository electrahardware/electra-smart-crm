import { useEffect, useState } from "react";
import { updateLead } from "../../services/leadService";
import type { Lead } from "../../types/lead";

type Props = {
  open: boolean;
  lead: Lead;
  onClose: () => void;
  onUpdated: () => void;
  onLeadUpdated: React.Dispatch<React.SetStateAction<Lead>>;
};

export default function RescheduleFollowupDialog({
  open,
  lead,
  onClose,
  onUpdated,
  onLeadUpdated,
}: Props) {

  const [saving, setSaving] = useState(false);

  const [nextDate, setNextDate] = useState("");

  useEffect(() => {
    if (!lead) return;

    setNextDate(
      lead.followupDate
        ? lead.followupDate.slice(0, 10)
        : ""
    );
  }, [lead]);

  if (!open) return null;

  async function handleDateChange(
    value: string
  ) {

    if (!lead.id) return;

    try {

      setSaving(true);

      setNextDate(value);

      const updatedLead = await updateLead(lead.id, {
  ...lead,
  followupDate: value,
});

onLeadUpdated(updatedLead);

onClose();

    } catch (err) {

      console.error(err);

      alert("Unable to reschedule follow-up.");

    } finally {

      setSaving(false);

    }

  }

  return (

    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm">

      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">

        <div className="border-b p-6">

          <h2 className="text-2xl font-bold">
            📅 Reschedule Follow-up
          </h2>

          <p className="mt-2 text-slate-500">
            Select a new follow-up date.
          </p>

        </div>

        <div className="space-y-6 p-6">

          <div>

            <label className="text-sm font-semibold">
              Customer
            </label>

            <div className="mt-2 rounded-xl border bg-slate-50 p-3">

              <div className="font-bold">
                {lead.shopName || "-"}
              </div>

              <div className="text-sm text-slate-500">
                {lead.customerName || "-"}
              </div>

            </div>

          </div>

          <div>

            <label className="text-sm font-semibold">
              Next Follow-up Date
            </label>

            <input
              type="date"
              value={nextDate}
              disabled={saving}
              onChange={(e) =>
                handleDateChange(e.target.value)
              }
              className="mt-2 w-full rounded-xl border p-3"
            />

            <button
  type="button"
  disabled={saving}
  onClick={() => handleDateChange("")}
  className="mt-3 rounded-lg border border-slate-300 px-3 py-2 text-sm hover:bg-slate-100"
>
  None
</button>

          </div>

        </div>

        <div className="flex justify-end border-t p-6">

          <button
            onClick={onClose}
            disabled={saving}
            className="rounded-xl border px-6 py-3"
          >
            Cancel
          </button>

        </div>

      </div>

    </div>

  );

}