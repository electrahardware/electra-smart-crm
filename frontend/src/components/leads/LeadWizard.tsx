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
import Step4Review from "./Step4Review";

type LeadWizardProps = {
  onClose?: () => void;
};

export default function LeadWizard({
  onClose,
}: LeadWizardProps) {

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

  function focusField(field: string) {
    requestAnimationFrame(() => {
      document.querySelector<HTMLElement>(`[data-lead-field="${field}"]`)?.focus();
    });
  }

  async function save() {


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

        toast.success("Lead updated successfully.");

      } else {

        await saveLead(lead);

       toast.success("Lead saved successfully.");

      }

      setLead(
        EmptyLead
      );

      setEditingId(
        null
      );

      setStep(1);

      onClose?.();

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

  function validateStepOne() {
    if (!lead.mobile.trim()) {
      toast.error("Mobile Number is required.");
      focusField("mobile");
      return false;
    }

    if (!lead.leadOwner.trim()) {
      toast.error("Lead Owner is required.");
      focusField("leadOwner");
      return false;
    }

    if (!lead.status.trim()) {
      toast.error("Lead Status is required.");
      focusField("status");
      return false;
    }

    return true;
  }

  function next() {

    if (step === 1) {
      if (!validateStepOne()) {
        return;
      }

      setStep(2);

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

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl shadow-black/10">

        <div className="border-b border-zinc-100 bg-gradient-to-r from-white to-red-50/45 p-5 sm:p-6">

          <h1 className="text-2xl font-bold tracking-[-.035em] text-zinc-900">

            {editingId
              ? "Edit Lead"
              : "Add New Lead"}

          </h1>

          <p className="mt-2 text-sm text-zinc-500">

            {editingId
              ? "Update the selected lead."
              : "Complete two quick steps to create a new lead."}

          </p>

        </div>

        <div className="bg-zinc-50/50 px-5 pt-5 sm:px-6 sm:pt-6">

          <div className="flex items-center justify-between">

            {[1, 2].map((item) => (

              <div
                key={item}
                className="flex flex-1 flex-col items-center"
              >

                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-full font-bold text-white ${
                    step >= item
                      ? "bg-red-600"
                      : "bg-zinc-200 text-zinc-500"
                  }`}
                >

                  {item}

                </div>

                <p className="mt-2 text-sm font-medium text-zinc-600">

                  {item === 1 && "Customer Details"}
                  {item === 2 && "Review & Save"}

                </p>

              </div>

            ))}

          </div>

        </div>

        <div className="bg-zinc-50/50 p-4 sm:p-6">

          {step === 1 && <Step1Customer />}

          {step === 2 && <Step4Review />}

        </div>

        <div className="sticky bottom-0 z-30 flex justify-between border-t border-zinc-200 bg-white/95 px-5 py-4 shadow-[0_-8px_22px_rgba(0,0,0,0.08)] backdrop-blur sm:px-6">

          <button
            data-lead-field="wizard-previous"
            onClick={previous}
            disabled={
              step === 1 ||
              loading
            }
            className={`rounded-xl px-6 py-3 font-semibold transition ${
              step === 1
                ? "cursor-not-allowed bg-zinc-100 text-zinc-400"
                : "border border-zinc-200 bg-white text-zinc-700 hover:border-red-200 hover:bg-red-50"
            }`}
          >

            Previous

          </button>

          <button
            data-lead-field="wizard-next"
            onClick={next}
            disabled={loading}
            className="rounded-xl bg-[#e31e24] px-8 py-3 font-semibold text-white shadow-[0_8px_18px_rgba(227,30,36,.2)] transition hover:bg-[#c9161c] disabled:cursor-not-allowed disabled:opacity-50"
          >

            {loading
              ? editingId
                ? "Updating..."
                : "Saving..."
              : step === 2
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
