import { useEffect, useState } from "react";
import {
  completeFollowup,
} from "../../services/leadService";
import type { Lead } from "../../types/lead";

type Props = {
  open: boolean;
  lead: Lead;
  onClose: () => void;
  onCompleted: () => void;
};

export default function CompleteFollowupDialog({
  open,
  lead,
  onClose,
  onCompleted,
}: Props) {
  const [loading, setLoading] = useState(false);

  const [note, setNote] = useState("");

  const [noteId, setNoteId] = useState<number | null>(null);

  const [editingDate, setEditingDate] =
    useState(false);

  const [dateChanged, setDateChanged] = useState(false);

  const [followupDate, setFollowupDate] =
    useState("");

  useEffect(() => {

  if (!lead) return;

  setNote(
    lead.notes || ""
  );

  setFollowupDate(
    lead.followupDate
      ? new Date(lead.followupDate)
          .toISOString()
          .split("T")[0]
      : ""
  );

  setEditingDate(false);

}, [lead]);

  if (!open) return null;

  async function handleComplete() {
    try {
      setLoading(true);

      if (!lead.id) return;

await completeFollowup(lead.id, {
  note,
  followupDate: dateChanged
    ? followupDate
    : null,
});

      onCompleted();

      onClose();
    } catch (err) {
      console.error(err);
      alert("Unable to complete follow-up.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm">

      <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl">

        <div className="border-b p-6">

          <h2 className="text-2xl font-bold">
            ✅ Complete Follow-up
          </h2>

          <p className="mt-2 text-slate-500">
            Review before completing.
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

            <div className="mb-2 flex items-center justify-between">

              <label className="text-sm font-semibold">
                Latest Notes
              </label>

            </div>

            <textarea
              rows={5}
              value={note}
              onChange={(e) =>
                setNote(e.target.value)
              }
              placeholder="Write today's discussion..."
              className="w-full rounded-xl border p-3"
            />

          </div>

          <div>

            <div className="mb-2 flex items-center justify-between">

              <label className="text-sm font-semibold">
                Next Follow-up Date
              </label>

              <button
                type="button"
                onClick={() =>
                  setEditingDate(
                    !editingDate
                  )
                }
                className="text-sm font-medium text-blue-600"
              >
                ✏ Edit
              </button>

            </div>

            {!editingDate ? (

              <div className="rounded-xl border bg-slate-50 p-3">

                {followupDate || "No follow-up date"}

              </div>

            ) : (

              <input
                type="date"
                value={followupDate}
                onChange={(e) => {

  setFollowupDate(e.target.value);

  setDateChanged(true);

}}
                className="w-full rounded-xl border p-3"
              />

            )}

          </div>

                  </div>

        <div className="flex justify-end gap-3 border-t p-6">

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-xl border px-6 py-3 hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={handleComplete}
            className="rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {loading ? "Completing..." : "Complete"}
          </button>

        </div>

      </div>

    </div>
  );
}