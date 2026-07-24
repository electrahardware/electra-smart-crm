type Props = {
  note: string;
  createdBy: string;
  createdAt: string;
};

export default function NoteCard({
  note,
  createdBy,
  createdAt,
}: Props) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="whitespace-pre-wrap text-sm text-slate-800">
        {note}
      </p>

      <div className="mt-4 flex items-center justify-between border-t pt-3 text-xs text-slate-500">
        <span>{createdBy}</span>
        <span>{createdAt}</span>
      </div>
    </div>
  );
}