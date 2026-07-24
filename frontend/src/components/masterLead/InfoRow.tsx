type Props = {
  label: string;
  value?: any;

  editable?: boolean;

  field?: string;

  form?: Record<string, any>;

  setForm?: React.Dispatch<React.SetStateAction<any>>;
};

export default function InfoRow({
  label,
  value,
  editable = false,
  field,
  form,
  setForm,
}: Props) {
  if (editable && field && form && setForm) {
    return (
      <div className="grid grid-cols-[170px_1fr] items-center gap-3 py-2 border-b last:border-none">

        <div className="text-sm font-medium text-slate-600">
          {label}
        </div>

        <input
          value={form[field] ?? ""}
          onChange={(e) =>
            setForm((prev: any) => ({
              ...prev,
              [field]: e.target.value,
            }))
          }
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
        />

      </div>
    );
  }

  return (
    <div className="grid grid-cols-[170px_1fr] items-center gap-3 py-2 border-b last:border-none">

      <div className="text-sm font-medium text-slate-600">
        {label}
      </div>

      <div className="text-sm text-slate-900 break-all">
        {value || "-"}
      </div>

    </div>
  );
}