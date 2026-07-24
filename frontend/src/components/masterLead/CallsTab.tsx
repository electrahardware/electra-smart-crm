import { useEffect, useState } from "react";
import {
  getLeadCalls,
  addLeadCall,
  deleteLeadCall,
} from "../../services/callService";

import type {
  LeadCall,
} from "../../services/callService";
import { useLeadDetails } from "../../contexts/LeadDetailsContext";

export default function CallsTab() {
  const { lead } = useLeadDetails();

  const [calls, setCalls] = useState<LeadCall[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    callType: "Connected",
    duration: "",
    remarks: "",
    nextFollowup: "",
  });

  async function loadCalls() {
    if (!lead) return;

    try {
      setLoading(true);
      const data = await getLeadCalls(lead.id);
      setCalls(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCalls();
  }, [lead]);

  async function handleSave() {
    if (!lead) return;

    try {
      setSaving(true);

      await addLeadCall(lead.id, {
        callType: form.callType,
        duration: form.duration
          ? Number(form.duration)
          : undefined,
        remarks: form.remarks,
        nextFollowup:
          form.nextFollowup || undefined,
      });

      setForm({
        callType: "Connected",
        duration: "",
        remarks: "",
        nextFollowup: "",
      });

      loadCalls();
    } catch (err) {
      console.error(err);
      alert("Unable to save call.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this call?")) return;

    try {
      await deleteLeadCall(id);
      loadCalls();
    } catch (err) {
      console.error(err);
      alert("Unable to delete.");
    }
  }

  if (!lead) {
    return (
      <div className="p-6 text-center text-gray-500">
        Select a Lead
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="rounded-lg border p-4 space-y-4">
        <h2 className="text-lg font-semibold">
          Log Call
        </h2>

        <select
          className="w-full border rounded p-2"
          value={form.callType}
          onChange={(e) =>
            setForm({
              ...form,
              callType: e.target.value,
            })
          }
        >
          <option>Connected</option>
          <option>No Answer</option>
          <option>Busy</option>
          <option>Switched Off</option>
          <option>Wrong Number</option>
          <option>Call Back Later</option>
        </select>

        <input
          className="w-full border rounded p-2"
          type="number"
          placeholder="Duration (Seconds)"
          value={form.duration}
          onChange={(e) =>
            setForm({
              ...form,
              duration: e.target.value,
            })
          }
        />

        <textarea
          className="w-full border rounded p-2"
          rows={3}
          placeholder="Remarks"
          value={form.remarks}
          onChange={(e) =>
            setForm({
              ...form,
              remarks: e.target.value,
            })
          }
        />

        <input
          className="w-full border rounded p-2"
          type="date"
          value={form.nextFollowup}
          onChange={(e) =>
            setForm({
              ...form,
              nextFollowup: e.target.value,
            })
          }
        />

        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Call"}
        </button>
      </div>

      <div className="rounded-lg border">
        <div className="border-b p-4 font-semibold">
          Call History
        </div>

        {loading ? (
          <div className="p-4">
            Loading...
          </div>
        ) : calls.length === 0 ? (
          <div className="p-4 text-gray-500">
            No calls found.
          </div>
        ) : (
          calls.map((call) => (
            <div
              key={call.id}
              className="border-b p-4 flex justify-between items-start"
            >
              <div>
                <div className="font-medium">
                  {call.callType}
                </div>

                {call.duration && (
                  <div className="text-sm text-gray-500">
                    Duration: {call.duration}s
                  </div>
                )}

                {call.remarks && (
                  <div className="text-sm mt-1">
                    {call.remarks}
                  </div>
                )}

                {call.nextFollowup && (
                  <div className="text-xs text-blue-600 mt-1">
                    Follow-up:{" "}
                    {new Date(
                      call.nextFollowup
                    ).toLocaleDateString()}
                  </div>
                )}

                <div className="text-xs text-gray-400 mt-2">
                  {new Date(
                    call.createdAt
                  ).toLocaleString()}
                </div>
              </div>

              <button
                onClick={() =>
                  handleDelete(call.id)
                }
                className="text-red-600 hover:underline"
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}