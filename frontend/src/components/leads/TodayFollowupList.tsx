import { useState } from "react";
import type { Lead } from "../../types/lead";
import { markFollowupDone } from "../../services/leadService";

interface Props {
  leads: Lead[];
  onRefresh: () => void;
}

export default function TodayFollowupList({
  leads,
  onRefresh,
}: Props) {
  const [showReschedule, setShowReschedule] =
    useState(false);

  const [selectedLead, setSelectedLead] =
    useState<Lead | null>(null);

  const today = new Date()
    .toISOString()
    .slice(0, 10);

  const todayLeads = leads.filter(
    (lead) =>
      lead.followupDate?.slice(0, 10) ===
      today
  );

  return (
    <>
      <div className="mt-6 rounded-2xl border bg-white shadow-sm">

        <div className="border-b p-5">

          <h2 className="text-xl font-bold">
            📅 Today's Follow-ups
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Customers requiring action today.
          </p>

        </div>

        {todayLeads.length === 0 ? (

          <div className="p-12 text-center text-slate-400">
            No follow-ups for today.
          </div>

        ) : (

          <div className="divide-y">

            {todayLeads.map((lead) => (

              <div
                key={lead.id}
                className="flex items-center justify-between p-5"
              >

                <div>

                  <h3 className="font-semibold text-slate-800">
                    {lead.customerName}
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    {lead.mobile}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    {lead.followupDate?.slice(0, 10)}
                  </p>

                </div>

                <div className="flex items-center gap-2">

                  <a
                    href={`tel:${lead.mobile}`}
                    className="rounded-lg bg-blue-100 px-3 py-2 hover:bg-blue-200"
                    title="Call"
                  >
                    📞
                  </a>

                  <a
                    href={`https://wa.me/91${lead.mobile}`}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg bg-green-100 px-3 py-2 hover:bg-green-200"
                    title="WhatsApp"
                  >
                    💬
                  </a>

                  <button
                    onClick={() => {
                      setSelectedLead(lead);
                      setShowReschedule(true);
                    }}
                    className="rounded-lg bg-orange-100 px-3 py-2 hover:bg-orange-200"
                    title="Reschedule"
                  >
                    📅
                  </button>

                  <button
                    onClick={async () => {
                      try {
                        await markFollowupDone(
                          lead.id!
                        );

                        onRefresh();

                        alert(
                          "Follow-up marked as completed."
                        );
                      } catch (error) {
                        console.error(error);

                        alert(
                          "Unable to update follow-up."
                        );
                      }
                    }}
                    className="rounded-lg bg-emerald-100 px-3 py-2 hover:bg-emerald-200"
                    title="Mark Done"
                  >
                    ✅
                  </button>

                </div>

              </div>

            ))}

          </div>

        )}

      </div>

      {showReschedule && selectedLead && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">

          <div className="w-[420px] rounded-2xl bg-white p-6 shadow-2xl">

            <h2 className="mb-5 text-xl font-bold">
              📅 Reschedule Follow-up
            </h2>

            <input
              type="date"
              className="mb-4 w-full rounded-lg border p-3"
            />

            <input
              type="time"
              className="mb-6 w-full rounded-lg border p-3"
            />

            <div className="flex justify-end gap-3">

              <button
                onClick={() => {
                  setShowReschedule(false);
                  setSelectedLead(null);
                }}
                className="rounded-lg border px-4 py-2"
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  alert(
                    "Reschedule feature will be connected in next step."
                  );

                  setShowReschedule(false);
                  setSelectedLead(null);
                }}
                className="rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700"
              >
                Save
              </button>

            </div>

          </div>

        </div>

      )}

    </>
  );
}