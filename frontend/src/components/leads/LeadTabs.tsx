interface Props {
  active: string;
  onChange: (tab: string) => void;
}

const tabs = [
  {
    label: "Details",
    icon: "📋",
  },
  {
    label: "Notes",
    icon: "📝",
  },
  {
    label: "Calls",
    icon: "📞",
  },
  {
  label: "Attachments",
  icon: "📎",
},
{
  label: "Follow-up",
  icon: "📅",
},
{
  label: "Timeline",
  icon: "🕒",
},
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
            key={tab.label}
            onClick={() => onChange(tab.label)}
            className={`flex items-center gap-2 px-5 py-3 font-semibold whitespace-nowrap transition
              ${
                active === tab.label
                  ? "border-b-2 border-blue-600 text-blue-600 bg-white"
                  : "text-slate-500 hover:text-slate-800"
              }`}
          >
            <span>{tab.icon}</span>

            <span>{tab.label}</span>

          </button>

        ))}

      </div>

    </div>
  );
}