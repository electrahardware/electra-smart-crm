import { useEffect, useState } from "react";
import { formatDate } from "../../utils/date";
import Toast from "../common/Toast";
import QuickNotes from "../common/QuickNotes";

import type { Lead } from "../../types/lead";

import {
  updateLead,
} from "../../services/leadService";
import LeadStatusQuickUpdate from "./LeadStatusQuickUpdate";

interface Props {
  lead: Lead;
}

export default function FollowupTab({
  lead,
}: Props) {

  const [saving, setSaving] =
    useState(false);

  const [note, setNote] =
    useState("");

  const [followupDate, setFollowupDate] =
    useState("");

  const [followupTime, setFollowupTime] =
    useState("");

  const [status, setStatus] = useState("None");

  const [toast, setToast] = useState("");

const [toastType, setToastType] = useState<
  "success" | "error"
>("success");

  useEffect(() => {

    setNote(lead.notes || "");

    setFollowupDate(
      lead.followupDate
        ? new Date(
            lead.followupDate
          )
            .toISOString()
            .slice(0, 10)
        : ""
    );

    setFollowupTime(
      lead.followupTime || ""
    );

    setStatus(lead.status || "None");

  }, [lead]);

  async function saveFollowup() {

    try {

      setSaving(true);

      const payload: Lead = {

        ...lead,

        notes: note,

        followupDate,

        followupTime,

        status,

        followupCompleted: false,

      };

      await updateLead(
  lead.id!,
  payload
);

      window.dispatchEvent(
        new Event(
          "lead-updated"
        )
      );

      setToastType("success");
setToast("Follow-up saved successfully.");

setTimeout(() => {
  setToast("");
}, 2500);

    } catch (error) {

      console.error(error);

      setToastType("error");
setToast("Unable to update follow-up.");

setTimeout(() => {
  setToast("");
}, 2500);

    } finally {

      setSaving(false);

    }

  }

    return (
  <>
    <Toast
      show={toast !== ""}
      message={toast}
      type={toastType}
    />

    <div className="space-y-6 p-6">

      <div className="rounded-xl border bg-white p-5 shadow-sm">

        <h2 className="mb-5 text-lg font-bold">
          📅 Follow-up Details
        </h2>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

          <div>

            <label className="mb-2 block text-sm font-semibold">
              Next Follow-up Date
            </label>

            <div className="flex gap-2">

  <input
    type="date"
    className="flex-1 rounded-md border p-2"
    value={followupDate}
    onChange={(e) =>
      setFollowupDate(e.target.value)
    }
  />

  <button
    type="button"
    onClick={() => {
      setFollowupDate("");
      setFollowupTime("");
    }}
    className="rounded-md border border-red-300 bg-red-50 px-4 text-red-600 hover:bg-red-100"
  >
    None
  </button>

</div>

          </div>

          <div>

            <label className="mb-2 block text-sm font-semibold">
              Follow-up Time
            </label>

            <input
              type="time"
              value={followupTime}
              onChange={(e) =>
                setFollowupTime(e.target.value)
              }
              className="w-full rounded-lg border p-3"
            />

          </div>

        </div>

        <div className="mt-5">

          <label className="mb-2 block text-sm font-semibold">Lead Status</label>
          <LeadStatusQuickUpdate leadId={lead.id!} currentStatus={status} onStatusChange={setStatus} deferSave />

        </div>

        <div className="mt-5">

          <label className="mb-2 block text-sm font-semibold">
            Follow-up Notes
          </label>

          <textarea
            rows={5}
            value={note}
            onChange={(e) =>
              setNote(e.target.value)
            }
            className="w-full rounded-lg border p-3"
            placeholder="Write follow-up discussion..."
          />

        </div>

        <div className="mt-4">
          <QuickNotes value={note} onChange={setNote} />
        </div>

        <div className="mt-6 flex flex-wrap gap-3">

          <button
            onClick={saveFollowup}
            disabled={saving}
            className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {saving
              ? "Saving..."
              : "💾 Save Follow-up"}
          </button>

      

        </div>

      </div>

      <div className="rounded-xl border bg-white p-5 shadow-sm">

        <h2 className="mb-4 text-lg font-bold">
          Current Follow-up
        </h2>

        <div className="space-y-3">

          <div className="flex justify-between border-b pb-2">

            <span className="font-medium">
              Status
            </span>

            <span>
              {lead.followupCompleted
                ? "✅ Completed"
                : "⏳ Pending"}
            </span>

          </div>

          <div className="flex justify-between border-b pb-2">

            <span className="font-medium">
              Date
            </span>

            <span>
  {followupDate
    ? formatDate(followupDate)
    : "-"}
</span>

          </div>

          <div className="flex justify-between border-b pb-2">

            <span className="font-medium">
              Time
            </span>

            <span>
              {followupTime || "-"}
            </span>

          </div>

          <div className="rounded-lg bg-slate-50 p-4">

            <div className="mb-2 font-semibold">
              Latest Note
            </div>

            <div className="whitespace-pre-wrap text-slate-700">

              {note.trim()
                ? note
                : "No notes available."}

            </div>

          </div>

        </div>

      </div>

        </div>
  </>
);

}
