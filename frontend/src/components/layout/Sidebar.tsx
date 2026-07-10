import {
  LayoutDashboard,
  Users,
  PhoneCall,
  FileText,
  BarChart3,
  Settings,
  Menu,
  X,
} from "lucide-react";

import { Link, useLocation } from "react-router-dom";

import logo from "../../assets/images/electra-logo.png";
import { useSidebar } from "../../hooks/useSidebar";

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
    title: "Reports",
    path: "/reports",
    icon: BarChart3,
  },
  {
    title: "Settings",
    path: "/settings",
    icon: Settings,
  },
];

export default function Sidebar() {

  const location = useLocation();

  const {
    open,
    toggle,
    setOpen,
  } = useSidebar();

  return (
    <>
      {/* Mobile Button */}

      <button
        onClick={toggle}
        className="fixed left-4 top-4 z-50 rounded-xl bg-red-600 p-2 text-white shadow-lg lg:hidden"
      >
        {open ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* Overlay */}

      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
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
          bg-slate-900
          text-white
          transition-transform
          duration-300

          ${open ? "translate-x-0" : "-translate-x-full"}

          lg:static
          lg:translate-x-0
        `}
      >

        <div className="border-b border-slate-800 bg-slate-950 p-3">

          <img
            src={logo}
            alt="Electra"
            className="mx-auto w-52 object-contain"
          />

          <p className="mt-2 text-center text-sm text-slate-400">

            Smart CRM v1.0

          </p>

        </div>

        <div className="mt-6 flex-1 px-3">

          {menu.map((item) => {

            const Icon = item.icon;

            const active =
              location.pathname === item.path;

            return (

              <Link
                key={item.title}
                to={item.path}
                onClick={() => setOpen(false)}
                className={`
                  mb-2
                  flex
                  items-center
                  gap-3
                  rounded-xl
                  px-4
                  py-3
                  transition

                  ${
                    active
                      ? "bg-red-600 text-white"
                      : "hover:bg-slate-800"
                  }
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