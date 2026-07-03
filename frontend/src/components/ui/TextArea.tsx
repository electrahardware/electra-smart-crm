import type { ChangeEvent } from "react";

type Props = {
  label: string;
  placeholder?: string;
  value?: string;
  required?: boolean;
  rows?: number;
  onChange?: (e: ChangeEvent<HTMLTextAreaElement>) => void;
};

export default function TextArea({
  label,
  placeholder = "",
  value = "",
  required = false,
  rows = 4,
  onChange,
}: Props) {
  return (
    <div className="flex flex-col gap-2">

      <label className="text-sm font-semibold text-slate-700">
        {label}

        {required && (
          <span className="ml-1 text-red-600">*</span>
        )}

      </label>

      <textarea
        rows={rows}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="
          w-full
          rounded-xl
          border
          border-slate-300
          px-4
          py-3
          outline-none
          resize-none
          transition
          focus:border-red-600
          focus:ring-2
          focus:ring-red-200
        "
      />

    </div>
  );
}