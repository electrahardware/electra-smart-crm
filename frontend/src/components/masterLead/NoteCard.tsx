import { Pencil, Trash2 } from "lucide-react";

type Props = {
  id: number;
  note: string;
  createdBy: string;
  createdAt: string;
  onDelete?: (id: number) => void;
  onEdit?: (id: number) => void;
};

export default function NoteCard({
  id,
  note,
  createdBy,
  createdAt,
  onDelete,
  onEdit,
}: Props) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="whitespace-pre-wrap text-sm text-slate-800">
        {note}
      </p>

      <div className="mt-4 flex items-center justify-between border-t pt-3">

  <div className="text-xs text-slate-500">
    <div>{createdBy}</div>
    <div>{createdAt}</div>
  </div>

  <div className="flex gap-2">

    <button
      type="button"
      onClick={() => onEdit?.(id)}
      className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
      title="Edit Note"
    >
      <Pencil size={16} />
    </button>

    <button
      type="button"
      onClick={() => onDelete?.(id)}
      className="rounded-lg p-2 text-red-600 hover:bg-red-50"
      title="Delete Note"
    >
      <Trash2 size={16} />
    </button>

  </div>

</div>
    </div>
  );
}