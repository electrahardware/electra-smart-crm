export const LEAD_STATUSES = [
  "New", "Contacted", "Follow-up", "Quotation Sent", "Negotiation", "Won", "Lost", "On Hold", "Not Interested",
] as const;

export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const STATUS_COLORS: Record<LeadStatus, string> = {
  New: "bg-slate-100 text-slate-700",
  Contacted: "bg-blue-100 text-blue-700",
  "Follow-up": "bg-sky-100 text-sky-700",
  "Quotation Sent": "bg-yellow-100 text-yellow-800",
  Negotiation: "bg-orange-100 text-orange-700",
  Won: "bg-emerald-100 text-emerald-700",
  Lost: "bg-red-100 text-red-700",
  "On Hold": "bg-purple-100 text-purple-700",
  "Not Interested": "bg-rose-100 text-rose-700",
};

export function normalizeLeadStatus(status?: string | null): LeadStatus {
  const value = (status || "").trim().toLowerCase();
  const aliases: Record<string, LeadStatus> = {
    "new lead": "New", new: "New", contacted: "Contacted", "follow up": "Follow-up", "follow-up": "Follow-up",
    qualified: "Negotiation", negotiation: "Negotiation", "proposal sent": "Quotation Sent", "quotation sent": "Quotation Sent",
    won: "Won", closed: "Won", customer: "Won", lost: "Lost", "no requirement": "Not Interested",
    "not interested": "Not Interested", "on hold": "On Hold", "whenever required": "On Hold",
  };
  return aliases[value] ?? "New";
}
