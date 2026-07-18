import { useState } from "react";
import LeadWizard from "./LeadWizard";
import QuickLeadBar from "./QuickLeadBar";

export default function LeadModeSelector() {
  const [mode, setMode] = useState<"quick" | "full">("quick");

  return (
    <>
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow mb-6">

        <h2 className="text-xl font-bold mb-5">
          Add Lead
        </h2>

        <div className="flex gap-4">

          <button
            onClick={() => setMode("quick")}
            className={`flex-1 rounded-xl p-5 transition ${
              mode === "quick"
                ? "bg-green-600 text-white"
                : "bg-slate-100"
            }`}
          >
            ⚡ Quick Lead
            <div className="text-sm mt-2 opacity-80">
              WhatsApp Inquiry
            </div>
          </button>

          <button
            onClick={() => setMode("full")}
            className={`flex-1 rounded-xl p-5 transition ${
              mode === "full"
                ? "bg-blue-600 text-white"
                : "bg-slate-100"
            }`}
          >
            📝 Full Lead
            <div className="text-sm mt-2 opacity-80">
              Complete Information
            </div>
          </button>

        </div>

      </div>

      {mode === "quick"
        ? <QuickLeadBar />
        : <LeadWizard />}
    </>
  );
}