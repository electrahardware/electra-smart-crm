import React, { useEffect, useState } from "react";
import { saveLeadForm } from "../../utils/leadStorage";

type SelectInputProps = {
  label: string;
  value?: string;
  required?: boolean;
  options: string[];
  field?: string;
  disabled?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
};

export default function SelectInput({
  label,
  value = "",
  required = false,
  options,
  field,
  disabled = false,
  onChange,
}: SelectInputProps) {
  const [selected, setSelected] = useState(value);

  useEffect(() => {
    setSelected(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelected(e.target.value);

    if (field) {
      saveLeadForm({
        [field]: e.target.value,
      });
    }

    if (onChange) {
      onChange(e);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-semibold text-slate-700">
        {label}

        {required && <span className="ml-1 text-red-600">*</span>}
      </label>

      <select
        data-lead-field={field}
        value={selected}
        onChange={handleChange}
        disabled={disabled}
        className={`
    w-full
    rounded-xl
    border
    border-slate-300
    px-4
    py-3
    outline-none
    transition
    focus:border-red-600
    focus:ring-2
    focus:ring-red-200
    ${disabled ? "bg-slate-100 cursor-not-allowed opacity-70" : ""}
  `}
      >
        <option value="">Select</option>

        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}
