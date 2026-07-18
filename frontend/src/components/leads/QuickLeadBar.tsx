import { useState } from "react";
import toast from "react-hot-toast";
import {
  createQuickLead,
  createQuickBulkLead,
} from "../../services/leadService";

export default function QuickLeadBar() {
  const [mobile, setMobile] = useState("");
  const [bulkMode, setBulkMode] = useState(false);
const [bulkNumbers, setBulkNumbers] = useState("");
  const [loading, setLoading] = useState(false);
  const [assignedTo, setAssignedTo] =
  useState("Dharmesh");

  async function handleSave() {

    if (bulkMode) {

  const numbers = bulkNumbers
    .split("\n")
    .map((n) => n.trim())
    .filter((n) => n.length > 0);

  if (numbers.length === 0) {
    toast.error("Enter WhatsApp Numbers");
    return;
  }

  try {

    setLoading(true);

    const result =
      await createQuickBulkLead({
  numbers,
  leadOwner: assignedTo,
});

    toast.success(
      `Created : ${result.created}
Duplicate : ${result.duplicates}
Invalid : ${result.invalid}`
    );

    setBulkNumbers("");

    setBulkMode(false);
    setMobile("");

    window.dispatchEvent(
      new Event("lead-imported")
    );

  } catch (err: any) {

    console.error(err);

    toast.error(
      err?.message ??
      "Unable to create leads."
    );

  } finally {

    setLoading(false);

  }

  return;
}

    if (!mobile.trim()) {
      toast.error("Enter WhatsApp Number");
      return;
    }

    if (mobile.trim().length < 10) {
      toast.error("Invalid Mobile Number");
      return;
    }

    try {
      setLoading(true);

      await createQuickLead({
  mobile: mobile.trim(),
  leadOwner: assignedTo,
});

      toast.success("Quick Lead Created");

      setMobile("");

      window.dispatchEvent(
        new Event("lead-imported")
      );
    } catch (err: any) {
      console.error(err);

      toast.error(
        err?.message ||
        "Unable to create lead."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl bg-gradient-to-r from-green-600 to-emerald-600 p-5 shadow-lg">

      <h2 className="text-xl font-bold text-white">
        ⚡ Quick Lead
      </h2>

      <p className="text-green-100 mt-1 mb-4">
        Save WhatsApp inquiries in 5 seconds
      </p>

      <div className="mb-4 flex gap-3">

  <button
    onClick={() => setBulkMode(false)}
    className={`rounded-xl px-4 py-2 transition ${
      !bulkMode
        ? "bg-white text-green-700"
        : "bg-green-700 text-white"
    }`}
  >
    Single
  </button>

  <button
    onClick={() => setBulkMode(true)}
    className={`rounded-xl px-4 py-2 transition ${
      bulkMode
        ? "bg-white text-green-700"
        : "bg-green-700 text-white"
    }`}
  >
    Bulk
  </button>

</div>

<div className="mb-4">

  <label className="mb-2 block text-sm font-semibold text-green-50">
  Assign To
</label>

  <select
    value={assignedTo}
    onChange={(e) =>
      setAssignedTo(e.target.value)
    }
    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-800 shadow-sm focus:border-green-500 focus:outline-none"
  >
    <option value="Dharmesh">
      Dharmesh
    </option>

    <option value="Dhiren">
      Dhiren
    </option>

    <option value="Harnish">
      Harnish
    </option>
  </select>

</div>

      <div className="flex gap-3">

  {bulkMode ? (

    <textarea
      autoFocus
      rows={8}
      value={bulkNumbers}
      onChange={(e) =>
        setBulkNumbers(e.target.value)
      }
      placeholder={`Enter one number per line

9876543210
9898989898
9822222222`}
      className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-800 placeholder:text-slate-400 shadow-sm focus:border-green-500 focus:outline-none"
    />

  ) : (

    <input
      autoFocus
      value={mobile}
      onChange={(e) =>
        setMobile(e.target.value)
      }
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          handleSave();
        }
      }}
      placeholder="Enter WhatsApp Number"
      className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-800 placeholder:text-slate-400 shadow-sm focus:border-green-500 focus:outline-none"
    />

  )}

  <button
    onClick={handleSave}
    disabled={loading}
   className="h-[52px] min-w-[120px] rounded-xl bg-white px-6 py-3 font-semibold text-green-700 shadow-sm transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
  >
    {loading
      ? "Saving..."
      : bulkMode
      ? "Create Leads"
      : "Save"}
  </button>

</div>

    </div>
  );
}