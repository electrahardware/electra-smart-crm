import React, { useEffect, useState } from "react";
import { saveLeadForm } from "../../utils/leadStorage";

type PhoneInputProps = {
  label: string;
  value?: string;
  required?: boolean;
  placeholder?: string;
  field?: string;
  onChange?: (value: string) => void;
};

export default function PhoneInput({
  label,
  value = "",
  required = false,
  placeholder = "9876543210",
  field,
  onChange,
}: PhoneInputProps) {

  const [mobile, setMobile] = useState(value);

  useEffect(() => {
    setMobile(value);
  }, [value]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {

    const numbers = e.target.value
      .replace(/\D/g, "")
      .slice(0, 10);

    setMobile(numbers);

    if (field) {

      saveLeadForm({
        [field]: numbers,
      });

    }

    if (onChange) {
      onChange(numbers);
    }

  };

  return (

    <div className="flex flex-col gap-2">

      <label className="text-sm font-semibold text-slate-700">

        {label}

        {required && (
          <span className="ml-1 text-red-600">*</span>
        )}

      </label>

      <div className="flex rounded-xl border border-slate-300 overflow-hidden focus-within:ring-2 focus-within:ring-red-200 focus-within:border-red-600">

        <div className="px-4 flex items-center bg-slate-100 text-slate-600 font-medium border-r">
          +91
        </div>

        <input
          data-lead-field={field}
          type="tel"
          value={mobile}
          placeholder={placeholder}
          onChange={handleChange}
          className="flex-1 px-4 py-3 outline-none"
        />

      </div>

    </div>

  );

}
