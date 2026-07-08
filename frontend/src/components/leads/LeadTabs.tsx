interface Props {
  active: string;
  onChange: (tab: string) => void;
}

const tabs = [
  "Details",
  "Notes",
  "Calls",
  "Attachments",
  "Timeline",
];

export default function LeadTabs({
  active,
  onChange,
}: Props) {
  return (
    <div className="border-b bg-slate-50">

      <div className="flex overflow-x-auto">

        {tabs.map((tab) => (

          <button
            key={tab}
            onClick={() => onChange(tab)}
            className={`px-5 py-3 font-semibold whitespace-nowrap transition
              ${
                active === tab
                  ? "border-b-2 border-blue-600 text-blue-600 bg-white"
                  : "text-slate-500 hover:text-slate-800"
              }`}
          >
            {tab}
          </button>

        ))}

      </div>

    </div>
  );
}