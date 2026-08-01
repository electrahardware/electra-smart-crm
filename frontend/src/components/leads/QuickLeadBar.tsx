import { useState } from "react";
import toast from "react-hot-toast";

import {
  createQuickBulkLead,
  createQuickLead,
} from "../../services/leadService";

interface QuickLeadBarProps {
  onClose: () => void;
  onOpenFull: () => void;
}

const DEFAULT_OWNER = "Dharmesh Bhai";

export default function QuickLeadBar({
  onClose,
  onOpenFull,
}: QuickLeadBarProps) {
  const [mobile, setMobile] = useState("");

  const [bulkMode, setBulkMode] = useState(false);

  const [bulkNumbers, setBulkNumbers] = useState("");

  const [loading, setLoading] = useState(false);

  // Owner preference permanently remember
  const [assignedTo, setAssignedTo] = useState(
    () => localStorage.getItem("quickLeadOwner") ?? DEFAULT_OWNER,
  );

  function handleOwnerChange(owner: string) {
    setAssignedTo(owner);

    localStorage.setItem("quickLeadOwner", owner);
  }

  async function handleSave() {
    if (bulkMode) {
      const numbers = bulkNumbers
        .split("\n")
        .map((n) => n.trim())
        .filter(Boolean);

      if (numbers.length === 0) {
        toast.error("Enter WhatsApp Numbers");
        return;
      }

      try {
        setLoading(true);

        const result = await createQuickBulkLead({
          numbers,
          leadOwner: assignedTo,
        });

        toast.success(`Created : ${result.created}
Duplicate : ${result.duplicates}
Invalid : ${result.invalid}`);

        setBulkNumbers("");
        setBulkMode(false);
        setMobile("");

        window.dispatchEvent(new Event("lead-imported"));
      } catch (err: any) {
        console.error(err);

        toast.error(err?.message ?? "Unable to create leads.");
      } finally {
        setLoading(false);
      }

      return;
    }

    const cleanMobile = mobile.trim();

    if (!cleanMobile) {
      toast.error("Enter WhatsApp Number");
      return;
    }

    if (!/^\d{10}$/.test(cleanMobile)) {
      toast.error("Mobile Number must be exactly 10 digits");
      return;
    }

    try {
      setLoading(true);

      await createQuickLead({
        mobile: cleanMobile,
        leadOwner: assignedTo,
      });

      toast.success("Quick Lead Created");

      setMobile("");

      window.dispatchEvent(new Event("lead-imported"));
    } catch (err: any) {
      console.error(err);

      toast.error(err?.message ?? "Unable to create lead.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-500">
        Save a WhatsApp inquiry in just a few seconds.
      </p>

      <div className="mb-4 flex gap-3">
        <button
          onClick={() => setBulkMode(false)}
          className={`rounded-xl px-4 py-2 transition ${
            !bulkMode ? "bg-white text-green-700" : "bg-green-700 text-white"
          }`}
        >
          Single
        </button>

        <button
          onClick={() => setBulkMode(true)}
          className={`rounded-xl px-4 py-2 transition ${
            bulkMode ? "bg-white text-green-700" : "bg-green-700 text-white"
          }`}
        >
          Bulk
        </button>
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700">
          Assign To
        </label>

        <select
          value={assignedTo}
          onChange={(e) => handleOwnerChange(e.target.value)}
          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 shadow-sm focus:outline-none"
        >
          <option value="Dharmesh Bhai">Dharmesh Bhai</option>
          <option value="Dhiren Bhai">Dhiren Bhai</option>
          <option value="Harnish Bhai">Harnish Bhai</option>
        </select>
      </div>

      <div className="flex gap-3">
        {bulkMode ? (
          <textarea
            autoFocus
            rows={8}
            value={bulkNumbers}
            onChange={(e) => setBulkNumbers(e.target.value)}
            placeholder={`Enter one number per line

9876543210
9898989898
9822222222`}
            className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 shadow-sm focus:outline-none"
          />
        ) : (
          <input
            autoFocus
            value={mobile}
            maxLength={10}
            inputMode="numeric"
            pattern="[0-9]*"
            onChange={(e) =>
              setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSave();
              }
            }}
            placeholder="Enter WhatsApp Number"
            className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 shadow-sm focus:outline-none"
          />
        )}

        <button
          onClick={handleSave}
          disabled={loading}
          className="h-[52px] min-w-[120px] rounded-xl bg-white px-6 py-3 font-semibold text-green-700 shadow-sm hover:bg-slate-100 disabled:opacity-60"
        >
          {loading ? "Saving..." : bulkMode ? "Create Leads" : "Save"}
        </button>
      </div>

      <div className="flex items-center justify-between border-t border-slate-200 pt-4">
        <button
          onClick={onClose}
          className="text-sm text-slate-500 hover:text-white"
        >
          Close
        </button>

        <button
          onClick={onOpenFull}
          className="text-sm font-semibold text-white underline"
        >
          Open Full Lead Form →
        </button>
      </div>
    </div>
  );
}
