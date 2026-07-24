import { Menu, Search } from "lucide-react";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

import NotificationBell from "./NotificationBell";
import ProfileMenu from "./ProfileMenu";

import { useSidebar } from "../../hooks/useSidebar";
import {
  useSearch,
} from "../../contexts/SearchContext";
import { searchLeads } from "../../services/masterSearchService";
import { useState } from "react";
import MasterLeadDrawer from "../masterLead/MasterLeadDrawer";
import MasterLeadTabs from "../masterLead/MasterLeadTabs";
import { getLeadDetails } from "../../services/leadDetailsService";
import { useLeadDetails } from "../../contexts/LeadDetailsContext";


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
  const [drawerOpen, setDrawerOpen] = useState(false);

  const {
  search,
  setSearch,
  loading,
  setLoading,
  results,
  setResults,
  dropdownOpen,
  setDropdownOpen,
  setSelectedLeadId,
} = useSearch();

const {
  setLead,
  setLoading: setLeadLoading,
} = useLeadDetails();

  const title =
    pageTitles[location.pathname] ?? "Electra Smart CRM";

  useEffect(() => {
    const timer = setTimeout(async () => {
      const q = search.trim();

      if (!q) {
  setResults([]);
  setDropdownOpen(false);
  return;
}

      try {
        setLoading(true);

        const data = await searchLeads(q);

setResults(data);
setDropdownOpen(data.length > 0);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [search, setLoading, setResults]);

  return (
    <>
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

      <div className="relative hidden w-full max-w-md lg:block">
        <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 px-4">
          <Search
            size={18}
            className="text-slate-400"
          />

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customers, mobile, GST..."
            className="w-full bg-transparent px-3 py-2 outline-none"
          />
        </div>

        {loading && (
          <div className="absolute left-0 right-0 mt-2 rounded-xl border bg-white p-3 shadow-lg">
            <p className="text-sm text-slate-500">
              Searching...
            </p>
          </div>
        )}

        {!loading && dropdownOpen && results.length > 0 && (
          <div className="absolute left-0 right-0 mt-2 max-h-80 overflow-auto rounded-xl border bg-white shadow-lg">
            {results.map((lead) => (
              <div
  key={lead.id}
  onClick={async () => {
  try {
    setLeadLoading(true);

    const data = await getLeadDetails(lead.id);

    setLead(data);

    setSelectedLeadId(lead.id);

    setDropdownOpen(false);
    setSearch("");
    setResults([]);

    setDrawerOpen(true);
  } catch (error) {
    console.error(error);
  } finally {
    setLeadLoading(false);
  }
}}

  className="cursor-pointer border-b p-3 transition hover:bg-slate-50"
>
                <div className="font-semibold">
                  {lead.customerName}
                </div>

                <div className="text-sm text-slate-600">
                  📱 {lead.mobile}
                </div>

                <div className="text-sm text-slate-500">
                  {lead.shopName || "-"}
                </div>

                <div className="text-xs text-slate-400">
                  {lead.city || "-"}
                  {lead.state ? `, ${lead.state}` : ""}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

            <div className="flex items-center gap-4">
        <NotificationBell />
        <ProfileMenu />
      </div>
    </header>

    <MasterLeadDrawer
  open={drawerOpen}
  onClose={() => setDrawerOpen(false)}
>
  <MasterLeadTabs />
</MasterLeadDrawer>
  </>
);
}