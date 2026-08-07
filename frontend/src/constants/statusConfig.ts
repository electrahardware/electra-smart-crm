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
  None: "border border-slate-700 bg-slate-800 text-slate-200",
  "Card Pending": "border border-slate-700 bg-slate-800 text-slate-100",
  "Whenever Required": "border border-blue-800 bg-blue-950 text-blue-200",
  "No Requirement": "border border-red-800 bg-red-950 text-red-200",
  "Same Day Dispatch": "border border-emerald-800 bg-emerald-950 text-emerald-200",
  Interested: "border border-sky-800 bg-sky-950 text-sky-200",
  Negotiation: "border border-orange-800 bg-orange-950 text-orange-200",
  "Will Visit": "border border-purple-800 bg-purple-950 text-purple-200",
  "Quotation Sent": "border border-yellow-800 bg-yellow-950 text-yellow-200",
  "Send Pdf": "border border-blue-800 bg-blue-950 text-blue-200",
  "Sample Sent": "border border-purple-800 bg-purple-950 text-purple-200",
  Visited: "border border-emerald-800 bg-emerald-950 text-emerald-200",
  Customer: "border border-green-800 bg-green-950 text-green-200",
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
