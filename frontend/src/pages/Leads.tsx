import * as XLSX from "xlsx";
import { useRef } from "react";
import MainLayout from "../layouts/MainLayout";
import LeadWizard from "../components/leads/LeadWizard";
import LeadTable from "../components/leads/LeadTable";
import FollowupPanel from "../components/leads/FollowupPanel";

export default function Leads() {
  const fileInputRef = useRef<HTMLInputElement>(null);

const handleImportClick = () => {
  fileInputRef.current?.click();
};

const handleFileChange = (
  e: React.ChangeEvent<HTMLInputElement>
) => {
  const file = e.target.files?.[0];

  if (!file) return;

  const reader = new FileReader();

  reader.onload = (event) => {
    const data = event.target?.result;

    const workbook = XLSX.read(data, {
      type: "binary",
    });

    const sheet =
      workbook.Sheets[
        workbook.SheetNames[0]
      ];

    const json =
      XLSX.utils.sheet_to_json(sheet);

    console.log(json);
  };

  reader.readAsBinaryString(file);
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

  <LeadWizard /><div className="grid grid-cols-4 gap-4">

  <button
    className="rounded-2xl bg-blue-600 text-white p-5 text-left hover:bg-blue-700 transition"
  >
    <h3 className="text-lg font-bold">
      ➕ New Lead
    </h3>

    <p className="text-blue-100 text-sm mt-1">
      Create a new customer lead
    </p>
  </button>

  <button
    className="rounded-2xl bg-green-600 text-white p-5 text-left hover:bg-green-700 transition"
  >
    <h3 className="text-lg font-bold">
      📤 Export Excel
    </h3>

    <p className="text-green-100 text-sm mt-1">
      Download all leads
    </p>
  </button>

  <label
  onClick={handleImportClick}
    className="rounded-2xl bg-purple-600 text-white p-5 text-left hover:bg-purple-700 transition"
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
    className="rounded-2xl bg-orange-600 text-white p-5 text-left hover:bg-orange-700 transition"
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

  <LeadTable />

</div>
    </MainLayout>
  );
}