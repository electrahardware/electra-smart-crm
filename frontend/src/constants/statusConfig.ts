export const LEAD_STATUSES = [
  "None", "Card Pending", "Whenever Required", "No Requirement", "Same Day Dispatch", "Interested", "Negotiation", "Will Visit", "Quotation Sent", "Customer",
] as const;

export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const STATUS_COLORS: Record<LeadStatus, string> = {
  None: "bg-slate-100 text-slate-600",
  "Card Pending": "bg-slate-100 text-slate-700",
  "Whenever Required": "bg-blue-100 text-blue-700",
  "No Requirement": "bg-red-100 text-red-700",
  "Same Day Dispatch": "bg-emerald-100 text-emerald-700",
  Interested: "bg-sky-100 text-sky-700",
  "Quotation Sent": "bg-yellow-100 text-yellow-800",
  Negotiation: "bg-orange-100 text-orange-700",
  "Will Visit": "bg-purple-100 text-purple-700",
  Customer: "bg-green-900 text-white",
};

export function normalizeLeadStatus(status?: string | null): LeadStatus {
  const value = (status || "").trim().toLowerCase();
  const aliases: Record<string, LeadStatus> = {
    "card pending": "Card Pending", "new lead": "Card Pending", new: "Card Pending", contacted: "Interested", interested: "Interested",
    "follow up": "Negotiation", "follow-up": "Negotiation", qualified: "Negotiation", negotiation: "Negotiation",
    "proposal sent": "Quotation Sent", "quotation sent": "Quotation Sent", won: "Customer", closed: "Customer", customer: "Customer",
    lost: "No Requirement", "no requirement": "No Requirement", "not interested": "No Requirement",
    "on hold": "Whenever Required", "whenever required": "Whenever Required", "same day dispatch": "Same Day Dispatch", "will visit": "Will Visit",
  };
  return aliases[value] ?? "None";
}
