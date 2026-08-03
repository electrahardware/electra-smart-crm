import {
  BarChart3,
  FileText,
  LayoutDashboard,
  Menu,
  PhoneCall,
  Settings,
  Users,
  X
} from "lucide-react";

import { Link, useLocation } from "react-router-dom";

import logo from "../../assets/images/electra-logo.png";
import { useSidebar } from "../../hooks/useSidebar";
import { isAdminOrManager } from "../../utils/auth";

const menu = [
  {
    title: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Leads",
    path: "/leads",
    icon: Users,
  },
  {
    title: "Follow-ups",
    path: "/followups",
    icon: PhoneCall,
  },
  {
    title: "Quotations",
    path: "/quotations",
    icon: FileText,
  },
  {
    title: "Analytics",
    path: "/analytics",
    icon: BarChart3,
  },

  {
    title: "Audit Logs",
    path: "/audit-logs",
    icon: FileText,
  },

  {
    title: "Settings",
    path: "/settings",
    icon: Settings,
  },
];

export default function Sidebar() {
  const location = useLocation();

  const { open, toggle, setOpen } = useSidebar();

  const canManageSettings = isAdminOrManager();

  return (
    <>
      {/* Mobile Button */}

      <button
        onClick={toggle}
        aria-label="Toggle navigation"
        className="rounded-lg p-2 text-zinc-700 transition hover:bg-zinc-100"
      >
        {open ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* Overlay */}

      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}

      <aside
        className={`
          fixed
          left-0
          top-0
          z-50
          flex
          h-screen
          w-72
          flex-col
          border-r
          border-white/10
          bg-[#111113]
          text-white
          transition-transform
          duration-300

          ${open ? "translate-x-0" : "-translate-x-full"}

        `}
      >
        <div className="border-b border-white/10 bg-black/30 px-5 py-6">
          <img
            src={logo}
            alt="Electra"
            className="mx-auto w-44 object-contain"
          />

          <p className="mt-3 text-center text-[10px] font-semibold uppercase tracking-[.22em] text-zinc-500">
            Smart CRM
          </p>
        </div>

        <div className="mt-6 flex-1 px-3">
          {menu.map((item) => {
            const Icon = item.icon;

            const active = location.pathname === item.path;

            if (
              !canManageSettings &&
              (item.path === "/settings" || item.path === "/audit-logs")
            ) {
              return null;
            }

            return (
              <Link
                key={item.title}
                to={item.path}
                onClick={() => setOpen(false)}
                className={`
                  mb-1.5
                  flex
                  items-center
                  gap-3
                  rounded-lg
                  px-4
                  py-3
                  transition

                  ${active ? "bg-[#e31e24] text-white shadow-[0_8px_22px_rgba(227,30,36,.28)]" : "text-zinc-300 hover:bg-white/8 hover:text-white"}
                `}
              >
                <Icon size={20} />

                {item.title}
              </Link>
            );
          })}
        </div>
      </aside>
    </>
  );
}
