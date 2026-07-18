import {
  useEffect,
  useRef,
  useState,
} from "react";
import {
  addLeadNote,
  getLeadNotes,
} from "../../services/leadService";
import QuickNotes from "../common/QuickNotes";
import toast from "react-hot-toast";

import type { Lead } from "../../types/lead";

type Props = {
  open: boolean;
  leadId: number;
  lead: Lead;
  onClose: () => void;
};

export default function LeadNotesDialog({
  open,
  leadId,
  lead,
  onClose,
}: Props) {

  const [loading, setLoading] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [note, setNote] =
    useState("");

  const textareaRef =
  useRef<HTMLTextAreaElement>(null);

  const [notes, setNotes] =
    useState<any[]>([]);

  useEffect(() => {

    if (!open) return;

    loadNotes();

  }, [open]);

  async function loadNotes() {

    try {

      setLoading(true);

      const data =
        await getLeadNotes(leadId);

      setNotes(data);

    } catch {

      toast.error(
        "Unable to load notes."
      );

    } finally {

      setLoading(false);

    }

  }

  async function handleSave() {

    if (!note.trim()) {

      toast.error(
        "Enter Note"
      );

      return;

    }

    try {

      setSaving(true);

      await addLeadNote(
        leadId,
        note
      );

      toast.success(
        "Note Added"
      );

      setNote("");

      loadNotes();

      setTimeout(() => {

  textareaRef.current?.focus();

}, 100);

      window.dispatchEvent(
        new Event("lead-imported")
      );

    } catch {

      toast.error(
        "Unable to save note."
      );

    } finally {

      setSaving(false);

    }

  }

  if (!open) return null;

  return (

    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">

      <div className="w-[700px] rounded-2xl bg-white p-6 shadow-2xl">

        <div className="mb-6 flex items-center justify-between">

          <h2 className="text-2xl font-bold">

            Customer Notes

          </h2>

          <button
            onClick={onClose}
          >
            ✖
          </button>

        </div>

        <div className="mb-5 rounded-xl border bg-slate-50 p-4">

  <div className="grid grid-cols-2 gap-4 text-sm">

    <div>
      <p className="text-slate-500">Customer</p>
      <p className="font-semibold">
        {lead.customerName || "-"}
      </p>
    </div>

    <div>
      <p className="text-slate-500">Mobile</p>
      <p className="font-semibold">
        {lead.mobile || "-"}
      </p>
    </div>

    <div>
      <p className="text-slate-500">Shop</p>
      <p className="font-semibold">
        {lead.shopName || "-"}
      </p>
    </div>

    <div>
      <p className="text-slate-500">Lead Owner</p>
      <p className="font-semibold">
        {lead.leadOwner || "-"}
      </p>
    </div>

  </div>

</div>

        {loading ? (

          <p>Loading...</p>

        ) : (

          <div className="mb-5 max-h-64 overflow-y-auto rounded-xl border p-3">

            {notes.length === 0 ? (

              <p className="text-slate-400">

                No Notes Found

              </p>

            ) : (

              notes.map((item) => (

  <div
    key={item.id}
    className="mb-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
  >

    <div className="mb-3 flex items-center justify-between">

      <div>

        <p className="text-xs font-medium text-slate-500">

          📅 {new Date(item.createdAt).toLocaleDateString()}

          {"  "}

          🕒 {new Date(item.createdAt).toLocaleTimeString()}

        </p>

        <p className="mt-1 text-xs text-indigo-600">

          👤 {item.createdBy}

        </p>

      </div>

    </div>

    <div className="whitespace-pre-wrap text-slate-700">

      {item.note}

    </div>

  </div>

))

            )}

          </div>

        )}

        <QuickNotes
          value={note}
          onChange={setNote}
        />

        <textarea
          ref={textareaRef}
          rows={5}
          value={note}
          onChange={(e) =>
            setNote(e.target.value)
          }
          className="mb-5 w-full rounded-xl border p-3"
          placeholder="Write Note..."
        />

        <div className="flex justify-end gap-3">

          <button
            onClick={onClose}
            className="rounded-xl border px-5 py-2"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-xl bg-green-600 px-5 py-2 text-white"
          >
            {saving
              ? "Saving..."
              : "Save Note"}
          </button>

        </div>

      </div>

    </div>

  );

}