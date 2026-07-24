import React from "react";

type Props = {
  label: string;
  field: string;
  form: Record<string, any>;
  setForm: React.Dispatch<React.SetStateAction<any>>;
  editMode: boolean;
};

export default function EditableInfoRow({
  label,
  field,
  form,
  setForm,
  editMode,
}: Props) {
  const value = form[field] ?? "";

  return (
    <div className="grid grid-cols-[170px_1fr] items-center gap-3 py-2 border-b last:border-none">
      <div className="text-sm font-medium text-slate-600">
        {label}
      </div>

      {editMode ? (
        <input
          type="text"
          value={value}
          onChange={(e) =>
            setForm((prev: Record<string, any>) => ({
              ...prev,
              [field]: e.target.value,
            }))
          }
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
        />
      ) : (
        <div className="text-sm text-slate-900 break-all">
          {value === "" ? "-" : String(value)}
        </div>
      )}
    </div>
  );
}