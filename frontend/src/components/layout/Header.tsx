import { Menu, Search } from "lucide-react";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import NotificationBell from "./NotificationBell";
import ProfileMenu from "./ProfileMenu";

import { useSidebar } from "../../hooks/useSidebar";
import {
  useSearch,
} from "../../contexts/SearchContext";
import { searchLeads } from "../../services/masterSearchService";
import { useState } from "react";
import LeadDetailsDrawer from "../leads/LeadDetailsDrawer";
import { useLead } from "../../hooks/useLead";import { getLeadDetails } from "../../services/leadDetailsService";
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
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const {
  setLead: setEditingLead,
  setEditingId,
  setWizardOpen,
} = useLead();

const [selectedLead, setSelectedLead] =
  useState<any>(null);

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
    <header className="sticky top-0 z-40 flex h-[4.5rem] items-center justify-between border-b border-black/7 bg-white/85 px-4 shadow-[0_1px_0_rgb(0_0_0_/_0.03)] backdrop-blur-xl sm:px-6">
      <div className="flex items-center gap-4">
        <button
          onClick={toggle}
          aria-label="Toggle navigation"
          className="rounded-lg p-2 text-zinc-700 transition hover:bg-zinc-100"
        >
          <Menu size={22} />
        </button>

        <h1 className="text-lg font-bold tracking-[-.025em] text-zinc-900 sm:text-xl">
          {title}
        </h1>
      </div>

      <div className="relative hidden w-full max-w-md lg:block">
        <form onSubmit={(event) => {
          event.preventDefault();
          const query = search.trim();
          if (query) {
            setDropdownOpen(false);
            navigate(`/leads?search=${encodeURIComponent(query)}`);
          }
        }} className="flex items-center rounded-xl border border-zinc-200 bg-zinc-50/80 px-4 transition focus-within:border-red-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-red-500/10">
          <button type="submit" aria-label="Search leads" className="rounded p-0.5 text-slate-400 transition hover:text-[#e31e24]">
          <Search
            size={18}
          />
          </button>

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customers, mobile, GST..."
            className="w-full border-0! bg-transparent! px-3 py-2 outline-none! ring-0!"
          />
        </form>

        {loading && (
          <div className="absolute left-0 right-0 mt-2 rounded-xl border border-zinc-200 bg-white p-3 shadow-xl shadow-black/8">
            <p className="text-sm text-slate-500">
              Searching...
            </p>
          </div>
        )}

        {!loading && dropdownOpen && results.length > 0 && (
          <div className="absolute left-0 right-0 mt-2 max-h-80 overflow-auto rounded-xl border border-zinc-200 bg-white shadow-xl shadow-black/10">
            {results.map((lead) => (
              <div
  key={lead.id}
  onClick={async () => {
  try {
    setLeadLoading(true);

    const data = await getLeadDetails(lead.id);

    setLead(data);

setSelectedLead(data);

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

  className="cursor-pointer border-b border-zinc-100 p-3 transition hover:bg-red-50/60"
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

    <LeadDetailsDrawer
  lead={selectedLead}
  onClose={() => {
    setDrawerOpen(false);
    setSelectedLead(null);
  }}
  onEdit={(lead) => {
  setDrawerOpen(false);

  setEditingId(lead.id!);

  setEditingLead({
    ...lead,
    products: Array.isArray(lead.products)
      ? lead.products
      : [],
    followupDate:
      lead.followupDate ?? "",
  });

  setWizardOpen(true);
}}
/>
  </>
);
}
