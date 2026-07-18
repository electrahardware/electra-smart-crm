import { QUICK_NOTES } from "../../constants/quickNotes";

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export default function QuickNotes({
  value,
  onChange,
}: Props) {

  function addNote(note: string) {

    const current = value.trim();

    if (!current) {
      onChange(note);
      return;
    }

    if (current.includes(note)) {
      return;
    }

    onChange(`${current}\n${note}`);
  }

  return (
    <div className="mb-4">

      <label className="mb-2 block text-sm font-semibold text-slate-600">
        Quick Notes
      </label>

      <div className="flex flex-wrap gap-2">

        {QUICK_NOTES.map((note) => (

          <button
            key={note}
            type="button"
            onClick={() => addNote(note)}
            className="rounded-full border border-slate-300 bg-slate-100 px-3 py-1 text-sm font-medium transition hover:bg-green-100 hover:border-green-500"
          >
            {note}
          </button>

        ))}

      </div>

    </div>
  );
}