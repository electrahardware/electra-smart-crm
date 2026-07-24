import { useEffect, useState } from "react";

import { useLeadDetails } from "../../contexts/LeadDetailsContext";

import {
  getLeadNotes,
  addLeadNote,
} from "../../services/leadService";

import NoteCard from "./NoteCard";

export default function NotesTab() {
  const { lead } = useLeadDetails();

  const [notes, setNotes] = useState<any[]>([]);

const [newNote, setNewNote] = useState("");

const [saving, setSaving] = useState(false);

  useEffect(() => {
  if (!lead) return;

  loadNotes();
}, [lead]);

const loadNotes = async () => {
  if (!lead) return;

  try {
    const data = await getLeadNotes(lead.id);

    setNotes(data);

  } catch (error) {

    console.error(error);

  }
};

const saveNote = async () => {
  if (!lead) return;

  if (!newNote.trim()) return;

  try {
    setSaving(true);

    await addLeadNote(
      lead.id,
      newNote.trim()
    );

    setNewNote("");

    await loadNotes();

    console.log("Note Added");

  } catch (error) {

    console.error(error);

    alert("Unable to save note.");

  } finally {

    setSaving(false);

  }
};

  return (
    <div className="p-6">

      {/* Add Note */}

      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

        <textarea
  rows={4}
  value={newNote}
  onChange={(e) => setNewNote(e.target.value)}
  placeholder="Write follow-up notes..."
  className="w-full rounded-lg border border-slate-300 p-3 outline-none focus:border-blue-500"
/>

        <div className="mt-4 flex justify-end">

          <button
  onClick={saveNote}
  disabled={saving}
  className="rounded-lg bg-blue-600 px-5 py-2 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
>
  {saving ? "Saving..." : "Add Note"}
</button>

        </div>

      </div>

      {/* Notes */}

      {notes.length === 0 ? (
        <div className="rounded-xl border border-dashed p-10 text-center text-slate-500">
          No notes available.
        </div>
      ) : (
        <div className="space-y-4">
          {notes.map((note: any) => (
            <NoteCard
              key={note.id}
              note={note.note}
              createdBy={note.createdBy ?? "System"}
              createdAt={new Date(
                note.createdAt
              ).toLocaleString()}
            />
          ))}
        </div>
      )}

    </div>
  );
}

