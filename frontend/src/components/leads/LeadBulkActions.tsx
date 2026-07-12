interface Props {
  selectedCount: number;

  onDelete: () => void;

  onExport: () => void;

  onClear: () => void;
}

export default function LeadBulkActions({
  selectedCount,
  onDelete,
  onExport,
  onClear,
}: Props) {

  if (selectedCount === 0) {

    return null;

  }

  return (

    <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-blue-200 bg-blue-50 p-4">

      <div className="font-semibold text-blue-700">

        {selectedCount} Lead(s) Selected

      </div>

      <div className="flex gap-3">

        <button
          onClick={onExport}
          className="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
        >
          Export
        </button>

        <button
          onClick={onDelete}
          className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
        >
          Delete
        </button>

        <button
          onClick={onClear}
          className="rounded-lg border px-4 py-2"
        >
          Clear
        </button>

      </div>

    </div>

  );

}