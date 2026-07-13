import { useState } from "react";

import type { Lead } from "../../types/lead";
import { EmptyLead } from "../../types/lead";

import { useLead } from "../../hooks/useLead";

import {
  markFollowupDone,
  updateLead,
} from "../../services/leadService";

import toast from "react-hot-toast";

type Props = {
  lead: Lead;
};

export default function FollowupCard({
  lead,
}: Props) {

  const {
    setLead,
    setEditingId,
  } = useLead();

  const [loading, setLoading] =
    useState(false);

  function handleEdit() {

    setEditingId(lead.id!);

    setLead({
      ...EmptyLead,
      ...lead,
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

  }

  async function handleDone() {

    if (!lead.id) {
      return;
    }

    try {

      setLoading(true);

      await markFollowupDone(
        lead.id
      );

      toast.success(
        "Follow-up completed successfully."
      );

      window.dispatchEvent(
        new Event("lead-imported")
      );

    } catch (error) {

      console.error(error);

      toast.error(
        "Unable to complete follow-up."
      );

    } finally {

      setLoading(false);

    }

  }

  async function handleReschedule() {

    if (!lead.id) {
      return;
    }

    const nextDate =
      window.prompt(
        "Enter next follow-up date (YYYY-MM-DD)"
      );

    if (!nextDate) {
      return;
    }

    try {

      setLoading(true);

      await updateLead(
  lead.id,
  {
    ...lead,
    followupDate: nextDate,
  }
);

      toast.success(
        "Follow-up rescheduled successfully."
      );

      window.dispatchEvent(
        new Event("lead-imported")
      );

    } catch (error) {

      console.error(error);

      toast.error(
        "Unable to reschedule follow-up."
      );

    } finally {

      setLoading(false);

    }

  }

  return (

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

  );

}  
    