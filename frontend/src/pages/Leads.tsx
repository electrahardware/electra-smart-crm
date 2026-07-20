import * as XLSX from "xlsx";
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import LeadWizard from "../components/leads/LeadWizard";
import LeadTable from "../components/leads/LeadTable";
import LeadSearch from "../components/leads/LeadSearch";
import FollowupPanel from "../components/leads/FollowupPanel";
import ImportPreviewTable from "../components/leads/ImportPreviewTable";
import { useImport } from "../hooks/useImport";
import toast from "react-hot-toast";
import QuickLeadBar from "../components/leads/QuickLeadBar";
import LeadModeSelector from "../components/leads/LeadModeSelector";
import { useLead } from "../hooks/useLead";

export default function Leads() {
  const { wizardOpen, setWizardOpen } =
  useLead();
  const fileInputRef = useRef<HTMLInputElement>(null);
 const {
  loading,
  preview,
  previewExcel,
  commit,
  clearPreview,
  duplicatePolicy,
  setDuplicatePolicy,
} = useImport();

const navigate = useNavigate();

const [search, setSearch] =
  useState("");

const handleImportClick = () => {
  fileInputRef.current?.click();
};

const handleFileChange = async (
  e: React.ChangeEvent<HTMLInputElement>
) => {
  const file = e.target.files?.[0];

  if (!file) {
    return;
  }

  try {
    await previewExcel(file);
  } catch (error) {
    console.error(error);

    toast.error(
  "Failed to import Excel."
);
  }

  e.target.value = "";
};
  return (
    <MainLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Lead Management
          </h1>

          <p className="text-slate-500 mt-1">
            Manage all customer leads and follow-ups.
          </p>
        </div>
      </div>

      <div className="space-y-8">
        {preview && (
  <div className="grid grid-cols-4 gap-4">
    <div className="rounded-xl bg-blue-100 p-4">
      <p className="text-sm text-slate-500">
        Total
      </p>

      <h2 className="text-3xl font-bold">
        {preview.summary.totalRows}
      </h2>
    </div>

    <div className="rounded-xl bg-green-100 p-4">
      <p className="text-sm text-slate-500">
        Ready
      </p>

      <h2 className="text-3xl font-bold text-green-700">
        {preview.summary.readyRows}
      </h2>
    </div>

    <div className="rounded-xl bg-yellow-100 p-4">
      <p className="text-sm text-slate-500">
        Duplicate
      </p>

      <h2 className="text-3xl font-bold text-yellow-700">
        {preview.summary.duplicateRows}
      </h2>
    </div>

    <div className="rounded-xl bg-red-100 p-4">
      <p className="text-sm text-slate-500">
        Invalid
      </p>

      <h2 className="text-3xl font-bold text-red-700">
        {preview.summary.invalidRows}
      </h2>
    </div>
  </div>
)}

  <LeadModeSelector />

  <div className="my-6">

  <LeadSearch
    value={search}
    onChange={setSearch}
  />

</div>

<div className="grid grid-cols-4 gap-4">

  <button
  onClick={() => setWizardOpen(true)}
  className="rounded-2xl bg-blue-600 text-white p-5 text-left transition hover:bg-blue-700"
>
    <h3 className="text-lg font-bold">
      ➕ New Lead
    </h3>

    <p className="text-blue-100 text-sm mt-1">
      Create a new customer lead
    </p>
  </button>

  <button
    onClick={() => {
      const headers = [[
        "Customer Name",
        "Shop Name",
        "Mobile",
        "WhatsApp",
        "Email",
        "GST",
        "Address",
        "Area",
        "District",
        "State",
        "Pincode",
        "Lead Owner",
        "Lead Source",
        "Priority",
        "Status",
        "Follow-up Date",
        "Notes 1",
        "Notes 2",
        "Notes 3",
        "Notes 4",
        "Notes 5",
      ]];

      const sheet = XLSX.utils.aoa_to_sheet(headers);

      const workbook = XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(
        workbook,
        sheet,
        "Lead Import"
      );

      XLSX.writeFile(
        workbook,
        "Electra_Lead_Import_Template.xlsx"
      );
    }}
    className="rounded-2xl bg-green-600 text-white p-5 text-left hover:bg-green-700 transition"
  >
    <h3 className="text-lg font-bold">
      📤 Download Template
    </h3>

    <p className="text-green-100 text-sm mt-1">
      Excel Import Format
    </p>
  </button>

  <label
    onClick={handleImportClick}
    className="rounded-2xl bg-purple-600 text-white p-5 text-left hover:bg-purple-700 transition cursor-pointer"
  >
    <h3 className="text-lg font-bold">
      📥 Import Excel
    </h3>

    <p className="text-purple-100 text-sm mt-1">
      Upload dealer list
    </p>
  </label>

  <input
    ref={fileInputRef}
    type="file"
    accept=".xlsx,.xls,.csv"
    className="hidden"
    onChange={handleFileChange}
  />

  <button
  onClick={() => navigate("/followups")}
  className="rounded-2xl bg-orange-600 text-white p-5 text-left transition hover:bg-orange-700"
>
    <h3 className="text-lg font-bold">
      🔔 Follow-up
    </h3>

    <p className="text-orange-100 text-sm mt-1">
      Today's reminders
    </p>
  </button>


</div>

<FollowupPanel />
{preview && (
  <>
    <div className="flex items-center justify-between rounded-xl border bg-white p-4">
      <div>
        <h3 className="text-lg font-bold">
          Excel Import Preview
        </h3>

        <p className="text-sm text-slate-500">
          Review the imported leads before saving them.
        </p>
      </div>

      <div className="flex gap-3">
        <button
          onClick={clearPreview}
          className="rounded-xl border border-slate-300 px-5 py-2 hover:bg-slate-100"
        >
          Cancel
        </button>

        <div className="flex gap-6 mb-4">

  <label className="flex items-center gap-2">

    <input
      type="radio"
      checked={
        duplicatePolicy ===
        "skip_existing"
      }
      onChange={() =>
        setDuplicatePolicy(
          "skip_existing"
        )
      }
    />

    Skip Existing

  </label>

  <label className="flex items-center gap-2">

    <input
      type="radio"
      checked={
        duplicatePolicy ===
        "update_existing"
      }
      onChange={() =>
        setDuplicatePolicy(
          "update_existing"
        )
      }
    />

    Update Existing

  </label>

</div>

        <button
          disabled={loading}
          onClick={async () => {
            const result = await commit();

            if (!result) return;

            toast.success(
  `Import Completed

Inserted : ${result.insertedRows}
Updated : ${result.updatedRows}
Skipped : ${result.skippedRows}
Failed : ${result.failedRows}`
);

            clearPreview();
            window.dispatchEvent(
  new Event("lead-imported")
);
          }}
          className="rounded-xl bg-green-600 px-5 py-2 font-semibold text-white hover:bg-green-700 disabled:opacity-50"
        >
          {loading
            ? "Importing..."         
            : "Import Leads"}
        </button>
      </div>
    </div>

    <ImportPreviewTable
      rows={preview.rows}
    />
  </>
)}

{wizardOpen && (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6"
  >
    <div
  className="relative max-h-[95vh] w-full max-w-6xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
>

      <button
        onClick={() => setWizardOpen(false)}
        className="absolute right-5 top-5 z-10 rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
      >
        ✕
      </button>

      <LeadWizard
  onClose={() => {
    setWizardOpen(false);
    window.dispatchEvent(
      new Event("lead-updated")
    );
  }}
/>

    </div>
  </div>
)}


  <LeadTable
  onEditLead={() => setWizardOpen(true)}
/>

  

</div>
    </MainLayout>
  );
}