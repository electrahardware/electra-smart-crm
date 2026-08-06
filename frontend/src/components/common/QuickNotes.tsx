import { QUICK_NOTES } from "../../constants/quickNotes";
import { formatDate } from "../../utils/date";

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export default function QuickNotes({
  value,
  onChange,
}: Props) {

  function addNote(note: string) {
    // Each click represents a separate follow-up activity. Never de-duplicate
    // quick notes; append a dated record while preserving typed content/order.
    const entry = `${note} - ${formatDate(new Date())}`;
    onChange(value ? `${value}\n${entry}` : entry);
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
