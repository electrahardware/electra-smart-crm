import React, { useEffect, useState } from "react";
import { saveLeadForm } from "../../utils/leadStorage";

type TextInputProps = {
  label: string;
  placeholder?: string;
  value?: string;
  type?: string;
  required?: boolean;
  readOnly?: boolean;
  field?: string;
  onChange?: (
    e: React.ChangeEvent<HTMLInputElement>
  ) => void;
};

export default function TextInput({
  label,
  placeholder = "",
  value = "",
  type = "text",
  required = false,
  readOnly = false,
  field,
  onChange,
}: TextInputProps) {

  const [text, setText] = useState(value);

  useEffect(() => {
    setText(value);
  }, [value]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {

    setText(e.target.value);

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

        {required && (
          <span className="ml-1 text-red-600">*</span>
        )}

      </label>

      <input
        type={type}
        value={text}
        readOnly={readOnly}
        onChange={handleChange}
        placeholder={placeholder}
        className="
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
          read-only:bg-slate-100
        "
      />

    </div>

  );

}