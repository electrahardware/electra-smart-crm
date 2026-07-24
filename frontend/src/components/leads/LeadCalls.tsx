import { useEffect, useState } from "react";

import {
  getLeadCalls,
  addLeadCall,
  deleteLeadCall,
  type LeadCall,
} from "../../services/callService";

interface Props {
  leadId: number;
}

export default function LeadCalls({
  leadId,
}: Props) {
  const [calls, setCalls] = useState<LeadCall[]>([]);

  const [remarks, setRemarks] = useState("");

  const [duration, setDuration] = useState("");

  const [callType, setCallType] = useState("Outgoing");

  async function loadCalls() {
    const data = await getLeadCalls(leadId);

    setCalls(data);
  }

  useEffect(() => {
    loadCalls();
  }, [leadId]);

  async function saveCall() {
    if (!remarks.trim()) {
      return;
    }

    await addLeadCall(leadId, {
  callType,
  duration: duration
    ? Number(duration)
    : undefined,
  remarks,
});

setRemarks("");
setDuration("");

window.dispatchEvent(
  new Event("lead-updated")
);

await loadCalls();
  }

  return (
    <div className="space-y-5">

      <div className="rounded-xl border p-5 space-y-4">

        <h3 className="font-bold text-lg">
          Add Call
        </h3>

        <select
          value={callType}
          onChange={(e) =>
            setCallType(e.target.value)
          }
          className="w-full rounded-lg border p-2"
        >
          <option>
            Outgoing
          </option>

          <option>
            Incoming
          </option>

          <option>
            Missed
          </option>

        </select>

        <input
          type="number"
          placeholder="Duration (minutes)"
          value={duration}
          onChange={(e) =>
            setDuration(e.target.value)
          }
          className="w-full rounded-lg border p-2"
        />

        <textarea
          rows={3}
          placeholder="Call Remarks..."
          value={remarks}
          onChange={(e) =>
            setRemarks(e.target.value)
          }
          className="w-full rounded-lg border p-3"
        />

        <button
          onClick={saveCall}
          className="rounded-lg bg-blue-600 px-5 py-2 text-white"
        >
          Save Call
        </button>

      </div>

      <div className="space-y-3">

        {calls.map((call) => (

          <div
            key={call.id}
            className="rounded-xl border p-4"
          >

            <div className="flex justify-between">

              <div>

                <div className="font-semibold">

                  📞 {call.callType}

                </div>

                <div className="text-sm text-slate-500">

                  {call.duration || 0} min

                </div>

              </div>

              <button
                onClick={async () => {

                  await deleteLeadCall(call.id);

window.dispatchEvent(
  new Event("lead-updated")
);

await loadCalls();

                }}
                className="text-red-600"
              >
                Delete
              </button>

            </div>

            <div className="mt-3">

              {call.remarks}

            </div>

            <div className="mt-2 text-xs text-slate-500">

              {new Date(
                call.createdAt
              ).toLocaleString()}

            </div>

          </div>

        ))}

        {calls.length === 0 && (

          <div className="rounded-xl border border-dashed p-8 text-center text-slate-400">

            No Calls Yet

          </div>

        )}

      </div>

    </div>
  );
}