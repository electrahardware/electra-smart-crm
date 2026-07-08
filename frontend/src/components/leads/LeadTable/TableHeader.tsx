interface Props {
  total: number;
  selected: number;
}

export default function TableHeader({
  total,
  selected,
}: Props) {
  return (
    <div className="flex items-center justify-between border-b px-5 py-4">

      <div>

        <h2 className="text-xl font-bold">
          Saved Leads
        </h2>

        <p className="text-sm text-slate-500 mt-1">
          Total Leads : {total}
        </p>

      </div>

      {selected > 0 && (

        <div className="rounded-xl bg-blue-50 px-4 py-2 text-blue-700 font-semibold">

          {selected} Selected

        </div>

      )}

    </div>
  );
}