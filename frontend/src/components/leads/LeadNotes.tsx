import { useEffect, useState } from "react";

import {
  getLeadNotes,
  addLeadNote,
  type Note,
} from "../../services/leadService";

interface Props {
  leadId: number;
}

export default function LeadNotes({
  leadId,
}: Props) {

  const [notes, setNotes] =
    useState<Note[]>([]);

  const [text, setText] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  async function loadNotes() {

    try {

      const data =
        await getLeadNotes(
          leadId
        );

      setNotes(data);

    } catch (error) {

      console.error(error);

    }

  }

  useEffect(() => {

    loadNotes();

  }, [leadId]);

  async function saveNote() {

    if (!text.trim()) {

      return;

    }

    try {

      setLoading(true);

      await addLeadNote(
        leadId,
        text
      );

      setText("");

      await loadNotes();

    } catch (error) {

      console.error(error);

    } finally {

      setLoading(false);

    }

  }

  return (

    <div className="space-y-5">

      <div className="flex gap-3">

        <textarea
          value={text}
          onChange={(e) =>
            setText(
              e.target.value
            )
          }
          rows={3}
          placeholder="Write a follow-up note..."
          className="flex-1 rounded-xl border p-3"
        />

        <button
          disabled={loading}
          onClick={saveNote}
          className="rounded-xl bg-blue-600 px-6 text-white disabled:opacity-50"
        >

          {loading
            ? "Saving..."
            : "Save"}

        </button>

      </div>

      <div className="space-y-4">

        {notes.length === 0 && (

          <div className="rounded-xl border border-dashed p-8 text-center text-slate-500">

            No notes available.

          </div>

        )}

        {notes.map((note) => (

          <div
            key={note.id}
            className="rounded-xl border p-4"
          >

            <div className="mb-2 flex items-center justify-between text-xs text-slate-500">

  <span>

    👤 {note.createdBy || "System"}

  </span>

  <span>

    {new Date(
      note.createdAt
    ).toLocaleString()}

  </span>

</div>

            <div>

              {note.note}

            </div>

          </div>

        ))}

      </div>

    </div>

  );

}