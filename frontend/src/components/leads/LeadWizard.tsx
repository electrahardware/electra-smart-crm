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

      <div className="rounded-2xl border border-slate-200 bg-white shadow-lg">

        <div className="border-b border-slate-200 p-5 sm:p-6">

          <h1 className="text-2xl font-bold text-slate-800">

            {editingId
              ? "Edit Lead"
              : "Add New Lead"}

          </h1>

          <p className="mt-2 text-slate-500">

            {editingId
              ? "Update the selected lead."
              : "Complete two quick steps to create a new lead."}

          </p>

        </div>

        <div className="px-5 pt-5 sm:px-6 sm:pt-6">

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
                      : "bg-slate-300"
                  }`}
                >

                  {item}

                </div>

                <p className="mt-2 text-sm text-slate-600">

                  {item === 1 && "Customer Details"}
                  {item === 2 && "Review & Save"}

                </p>

              </div>

            ))}

          </div>

        </div>

        <div className="p-4 sm:p-6">

          {step === 1 && <Step1Customer />}

          {step === 2 && <Step4Review />}

        </div>

        <div className="sticky bottom-0 z-30 flex justify-between border-t border-slate-200 bg-slate-50 px-5 py-4 shadow-[0_-8px_18px_rgba(15,23,42,0.08)] sm:px-6">

          <button
            data-lead-field="wizard-previous"
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
            data-lead-field="wizard-next"
            onClick={next}
            disabled={loading}
            className="rounded-xl bg-red-600 px-8 py-3 font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
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
