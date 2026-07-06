import { useEffect, useState } from "react";

import {
  getLeadNotes,
  addLeadNote,
} from "../../services/leadService";

interface Note {
  id: number;
  note: string;
  createdAt: string;
}

interface Props {
  leadId: number;
}

export default function LeadNotes({
  leadId,
}: Props) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [text, setText] = useState("");

  async function loadNotes() {
    try {
      const data = await getLeadNotes(
        leadId
      );

      setNotes(data);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    loadNotes();
  }, [leadId]);

  async function saveNote() {
    if (!text.trim()) {
      return;
    }

    await addLeadNote(
      leadId,
      text
    );

    setText("");

    await loadNotes();
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
          onClick={saveNote}
          className="rounded-xl bg-blue-600 text-white px-6"
        >
          Save
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

            <div className="text-xs text-slate-500 mb-2">

              {new Date(
                note.createdAt
              ).toLocaleString()}

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