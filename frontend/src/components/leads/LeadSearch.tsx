interface Props {
  value: string;
  onChange: (value: string) => void;
}

export default function LeadSearch({
  value,
  onChange,
}: Props) {

  return (

    <div className="w-full">

      <input
        type="text"
        placeholder="🔍 Search Customer, Mobile, Shop, GST..."
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        className="w-full rounded-xl border border-slate-300 bg-white px-5 py-3 shadow-sm outline-none transition focus:border-blue-500"
      />

    </div>

  );

}