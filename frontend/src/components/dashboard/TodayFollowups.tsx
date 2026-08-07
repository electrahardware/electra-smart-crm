import { useEffect, useState } from "react";

import type { Lead } from "../../types/lead";
import { getTodayFollowups } from "../../services/followupService";
import { getLeadDetails } from "../../services/leadDetailsService";
import LeadDetailsDrawer from "../leads/LeadDetailsDrawer";
import LeadWizard from "../leads/LeadWizard";
import { useLead } from "../../hooks/useLead";

export default function TodayFollowups() {

  const [followups, setFollowups] =
  useState<Lead[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [openingLeadId, setOpeningLeadId] = useState<number | null>(null);
  const { setLead, setEditingId, wizardOpen, setWizardOpen } = useLead();

  useEffect(() => {

    loadFollowups();

  }, []);

  async function loadFollowups() {

    try {

      const data =
        await getTodayFollowups();

      setFollowups(data);

    } catch (error) {

      console.error(error);

    }

  }

  async function openLeadDetails(id?: number) {
    if (!id || openingLeadId) return;

    try {
      setOpeningLeadId(id);
      const lead = await getLeadDetails(id) as Lead;
      setSelectedLead(lead);
    } catch (error) {
      console.error(error);
    } finally {
      setOpeningLeadId(null);
    }
  }

  return (

    <div className="rounded-2xl border bg-white p-6 shadow-sm">

      <h2 className="text-xl font-bold">

        📅 Today's Follow-ups

      </h2>

      {followups.length === 0 ? (

        <div className="py-10 text-center text-slate-400">

          No Follow-ups Today

        </div>

      ) : (

        <div className="mt-5 space-y-3">

          {followups.map((item) => {
            const customerName = item.customerName?.trim();
            const shopName = item.shopName?.trim();
            const mobile = item.mobile?.trim();
            const title = customerName || shopName || mobile || "Unnamed lead";
            const detail = customerName ? (shopName || mobile || "No shop or mobile number") : (mobile || shopName || "No contact number");

            return (

            <button
              type="button"
              key={item.id}
              onClick={() => openLeadDetails(item.id)}
              disabled={openingLeadId === item.id}
              className="w-full rounded-xl border border-white/10 bg-[#191c21] p-4 text-left shadow-sm transition duration-200 hover:border-red-400/60 hover:bg-[#20242b] hover:shadow-[0_10px_24px_rgba(0,0,0,.2)] focus:outline-none focus:ring-2 focus:ring-red-500/30"
            >

              <div className="flex items-center justify-between">

                <div>

                  <p className="font-semibold text-zinc-100">{openingLeadId === item.id ? "Opening lead details..." : title}</p>

                  <p className="mt-1 text-sm text-zinc-400">{detail}</p>

                </div>

                <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-600">

                  {item.followupTime || "Today"}

                </span>

              </div>

            </button>

            );
          })}

        </div>

      )}

      <LeadDetailsDrawer
        lead={selectedLead}
        onClose={() => setSelectedLead(null)}
        onEdit={(lead) => {
          setSelectedLead(null);
          setEditingId(lead.id ?? null);
          setLead({ ...lead, products: Array.isArray(lead.products) ? lead.products : [], followupDate: lead.followupDate ?? "" });
          setWizardOpen(true);
        }}
      />

      {wizardOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-6">
          <div className="relative max-h-[95vh] w-full max-w-6xl overflow-y-auto rounded-2xl shadow-2xl">
            <button onClick={() => setWizardOpen(false)} className="absolute right-5 top-5 z-10 rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700">×</button>
            <LeadWizard onClose={() => { setWizardOpen(false); window.dispatchEvent(new Event("lead-updated")); }} />
          </div>
        </div>
      )}

    </div>

  );

}
