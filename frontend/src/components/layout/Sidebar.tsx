import {
  LayoutDashboard,
  Users,
  PhoneCall,
  FileText,
  BarChart3,
  Settings,
} from "lucide-react";

import logo from "../../assets/images/electra-logo.png";

const menu = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Leads",
    icon: Users,
  },
  {
    title: "Follow-ups",
    icon: PhoneCall,
  },
  {
    title: "Quotations",
    icon: FileText,
  },
  {
    title: "Reports",
    icon: BarChart3,
  },
  {
    title: "Settings",
    icon: Settings,
  },
];

export default function Sidebar() {
  return (
    <aside className="w-72 h-screen bg-slate-900 text-white flex flex-col">

      <div className="border-b border-slate-800 bg-slate-950 p-1">

        <img
          src={logo}
          alt="Electra"
          className="w-100 mx-auto object-contain"
        />

        <p className="text-center text-slate-400 mt-2 text-sm">
          Smart CRM v1.0
        </p>

      </div>

      <div className="flex-1 mt-6 px-3">

        {menu.map((item) => {

          const Icon = item.icon;

          return (
            <button
              key={item.title}
              className="flex items-center gap-3 w-full rounded-xl px-4 py-3 mb-2 hover:bg-red-600 transition-all duration-200"
            >
              <Icon size={20} />

              {item.title}
            </button>
          );

        })}

      </div>

    </aside>
  );
}