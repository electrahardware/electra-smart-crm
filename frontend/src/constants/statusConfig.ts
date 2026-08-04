export const LEAD_STATUSES = [
  "Card Pending",
  "Whenever Required",
  "No Requirement",
  "Same Day Dispatch",
  "Interested",
  "Negotiation",
  "Will Visit",
  "Quotation Sent",
  "Send Pdf",
  "Sample Sent",
  "Visited",
  "Customer",
] as const;

export type LeadStatus = (typeof LEAD_STATUSES)[number];
export type LeadStatusValue = LeadStatus | "None";
export const LEAD_STATUS_OPTIONS: LeadStatusValue[] = ["None", ...LEAD_STATUSES];

export const STATUS_COLORS: Record<LeadStatusValue, string> = {
  None: "bg-slate-100 text-slate-600",
  "Card Pending": "bg-slate-100 text-slate-700",
  "Whenever Required": "bg-blue-100 text-blue-700",
  "No Requirement": "bg-red-100 text-red-700",
  "Same Day Dispatch": "bg-emerald-100 text-emerald-700",
  Interested: "bg-sky-100 text-sky-700",
  Negotiation: "bg-orange-100 text-orange-700",
  "Will Visit": "bg-purple-100 text-purple-700",
  "Quotation Sent": "bg-yellow-100 text-yellow-800",
  "Send Pdf": "bg-blue-100 text-blue-700",
  "Sample Sent": "bg-purple-100 text-purple-700",
  Visited: "bg-emerald-100 text-emerald-700",
  Customer: "bg-green-900 text-white",
};

export function normalizeLeadStatus(status?: string | null): LeadStatusValue {
  const value = (status || "").trim().toLowerCase();
  const aliases: Record<string, LeadStatusValue> = {
    none: "None", new: "Card Pending", contacted: "Interested", interested: "Interested", negotiation: "Negotiation",
    "follow up": "Negotiation", "follow-up": "Negotiation", qualified: "Negotiation",
    "proposal sent": "Quotation Sent", "quotation sent": "Quotation Sent", "send pdf": "Send Pdf",
    "sample sent": "Sample Sent", visited: "Visited", "will visit": "Will Visit", customer: "Customer",
    won: "Customer", "closed won": "Customer", closed: "Customer",
    lost: "No Requirement", "closed lost": "No Requirement", "not interested": "No Requirement",
    "no requirement": "No Requirement", "same day dispatch": "Same Day Dispatch",
    "whenever required": "Whenever Required", "card pending": "Card Pending", "new lead": "Card Pending", "on hold": "Whenever Required",
  };
  return aliases[value] ?? "None";
}

export function getSelectableLeadStatus(status?: string | null): LeadStatusValue {
  const normalized = normalizeLeadStatus(status);
  return LEAD_STATUS_OPTIONS.includes(normalized) ? normalized : "None";
}
