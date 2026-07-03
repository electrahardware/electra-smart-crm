import { useState } from "react";

import { useLead } from "../../hooks/useLead";
import { EmptyLead } from "../../types/lead";
import {
  saveLead,
  updateLead,
} from "../../services/leadService";

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

  const [step, setStep] = useState(1);

  const [loading, setLoading] = useState(false);
  const [duplicateLead, setDuplicateLead] =
  useState<any>(null);

 async function save() {

  try {

    setLoading(true);

    if (editingId) {

      await updateLead(
        editingId,
        lead
      );

      alert("Lead Updated Successfully ✅");

    } else {

      await saveLead(lead);

      alert("Lead Saved Successfully ✅");

    }

    setLead(EmptyLead);

    setEditingId(null);

    setStep(1);

  } catch (err: any) {

  console.error(err);

  if (
    err.message ===
    "Duplicate Mobile Number"
  ) {

    setDuplicateLead(err.data.lead);

    return;

  }

  alert("Unable to Save Lead");



  } finally {

    setLoading(false);

  }

}

  function next() {

    if (step < 4) {

      setStep(step + 1);

      return;

    }

    save();

  }

  function previous() {

    if (step > 1) {

      setStep(step - 1);

    }

  }

  return (

    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">

      <div className="border-b border-slate-200 p-8">

        <h1 className="text-3xl font-bold text-slate-800">
          {editingId
  ? "Edit Lead"
  : "Add New Lead"}
        </h1>

        <p className="text-slate-500 mt-2">
          {editingId
  ? "Update the selected lead."
  : "Complete all four steps to create a new lead."}
        </p>

      </div>

      <div className="px-8 pt-8">

        <div className="flex items-center justify-between">

          {[1,2,3,4].map((item)=>(

            <div
              key={item}
              className="flex flex-col items-center flex-1"
            >

              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white ${
                  step >= item
                  ? "bg-red-600"
                  : "bg-slate-300"
                }`}
              >

                {item}

              </div>

              <p className="text-sm mt-2 text-slate-600">

                {item===1 && "Customer"}

                {item===2 && "Business"}

                {item===3 && "Follow-up"}

                {item===4 && "Review"}

              </p>

            </div>

          ))}

        </div>

      </div>

      <div className="p-8">

        {step===1 && <Step1Customer />}

        {step===2 && <Step2Business />}

        {step===3 && <Step3Followup />}

        {step===4 && <Step4Review />}

      </div>      <div className="border-t border-slate-200 bg-slate-50 px-8 py-6 flex justify-between">

        <button
          onClick={previous}
          disabled={step === 1 || loading}
          className={`px-6 py-3 rounded-xl font-semibold transition ${
            step === 1
              ? "bg-slate-200 text-slate-400 cursor-not-allowed"
              : "bg-white border border-slate-300 hover:bg-slate-100"
          }`}
        >
          Previous
        </button>

        <button
          onClick={next}
          disabled={loading}
          className="px-8 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold transition disabled:opacity-50"
        >
      {loading
  ? "Saving..."
  : step === 4
    ? (editingId ? "Update Lead" : "Save Lead")
    : "Next"}
        </button>

      </div>

    </div>

  );

}