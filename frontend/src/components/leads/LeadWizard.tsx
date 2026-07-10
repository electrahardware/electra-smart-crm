import { useState } from "react";
import toast from "react-hot-toast";

import { useLead } from "../../hooks/useLead";
import { EmptyLead } from "../../types/lead";
import {
  saveLead,
  updateLead,
} from "../../services/leadService";

import LoadingOverlay from "../common/LoadingOverlay";

import Step1Customer from "./Step1Customer";
import Step2Business from "./Step2Business";
import Step3Followup from "./Step3Followup";
import Step4Review from "./Step4Review";

export default function LeadWizard() {

  const {
    lead,
    setLead,
    editingId,
    setEditingId,
  } = useLead();

  const [step, setStep] =
    useState(1);

  const [loading, setLoading] =
    useState(false);

  const [duplicateLead, setDuplicateLead] =
    useState<any>(null);

  async function save() {

    if (!lead.customerName.trim()) {

      toast.error(
        "Customer Name is required."
      );

      return;

    }

    if (!lead.mobile.trim()) {

      toast.error(
        "Mobile Number is required."
      );

      return;

    }

    try {

      setLoading(true);

      if (editingId) {

        await updateLead(
          editingId,
          lead
        );

        toast.success(
          `Lead "${lead.customerName}" updated successfully.`
        );

      } else {

        await saveLead(lead);

        toast.success(
          `Lead "${lead.customerName}" saved successfully.`
        );

      }

      setLead(
        EmptyLead
      );

      setEditingId(
        null
      );

      setStep(1);

    } catch (err: any) {

      console.error(err);

      if (
        err?.message ===
        "Duplicate Mobile Number"
      ) {

        setDuplicateLead(
          err.data?.lead
        );

        toast.error(
          "Mobile number already exists."
        );

        return;

      }

      toast.error(
        err?.message ||
        "Unable to save lead."
      );

    } finally {

      setLoading(false);

    }

  }

  function next() {

    if (step < 4) {

      setStep(
        (prev) => prev + 1
      );

      return;

    }

    save();

  }

  function previous() {

    if (step > 1) {

      setStep(
        (prev) => prev - 1
      );

    }

  }

  return (

    <>

      <LoadingOverlay
        open={loading}
        text={
          editingId
            ? "Updating Lead..."
            : "Saving Lead..."
        }
      />

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">

        <div className="border-b border-slate-200 p-8">

          <h1 className="text-3xl font-bold text-slate-800">

            {editingId
              ? "Edit Lead"
              : "Add New Lead"}

          </h1>

          <p className="mt-2 text-slate-500">

            {editingId
              ? "Update the selected lead."
              : "Complete all four steps to create a new lead."}

          </p>

        </div>

        <div className="px-8 pt-8">

          <div className="flex items-center justify-between">

            {[1, 2, 3, 4].map((item) => (

              <div
                key={item}
                className="flex flex-1 flex-col items-center"
              >

                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-full font-bold text-white ${
                    step >= item
                      ? "bg-red-600"
                      : "bg-slate-300"
                  }`}
                >

                  {item}

                </div>

                <p className="mt-2 text-sm text-slate-600">

                  {item === 1 && "Customer"}
                  {item === 2 && "Business"}
                  {item === 3 && "Follow-up"}
                  {item === 4 && "Review"}

                </p>

              </div>

            ))}

          </div>

        </div>

        <div className="p-8">

          {step === 1 && <Step1Customer />}

          {step === 2 && <Step2Business />}

          {step === 3 && <Step3Followup />}

          {step === 4 && <Step4Review />}

        </div>

        <div className="flex justify-between border-t border-slate-200 bg-slate-50 px-8 py-6">

          <button
            onClick={previous}
            disabled={
              step === 1 ||
              loading
            }
            className={`rounded-xl px-6 py-3 font-semibold transition ${
              step === 1
                ? "cursor-not-allowed bg-slate-200 text-slate-400"
                : "border border-slate-300 bg-white hover:bg-slate-100"
            }`}
          >

            Previous

          </button>

          <button
            onClick={next}
            disabled={loading}
            className="rounded-xl bg-red-600 px-8 py-3 font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >

            {loading
              ? editingId
                ? "Updating..."
                : "Saving..."
              : step === 4
                ? editingId
                  ? "Update Lead"
                  : "Save Lead"
                : "Next"}

          </button>

        </div>

      </div>

    </>

  );

}