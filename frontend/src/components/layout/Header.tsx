import { Menu, Search } from "lucide-react";
import { useLocation } from "react-router-dom";
import NotificationBell from "./NotificationBell";
import ProfileMenu from "./ProfileMenu";
import { useSidebar } from "../../hooks/useSidebar";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/leads": "Lead Management",
  "/followups": "Follow-ups",
  "/quotations": "Quotations",
  "/reports": "Reports",
  "/settings": "Settings",
  "/duplicates": "Duplicate Leads",
};

export default function Header() {
  const { toggle } = useSidebar();
  const location = useLocation();

  const title =
    pageTitles[location.pathname] ?? "Electra Smart CRM";

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6 shadow-sm">

      <div className="flex items-center gap-4">

        <button
          onClick={toggle}
          className="rounded-xl p-2 transition hover:bg-slate-100"
        >
          <Menu size={22} />
        </button>

        <h1 className="text-2xl font-bold text-slate-800">
          {title}
        </h1>

      </div>

      <div className="hidden w-full max-w-md items-center rounded-xl border border-slate-200 bg-slate-50 px-4 lg:flex">

        <Search
          size={18}
          className="text-slate-400"
        />

        <input
          type="text"
          placeholder="Search customers, mobile, GST..."
          className="w-full bg-transparent px-3 py-2 outline-none"
        />

      </div>

      <div className="flex items-center gap-4">

        <NotificationBell />

        <ProfileMenu />

      </div>

    </header>
  );
}