export const LEAD_STATUSES = ["None", "Card Pending", "Whenever Required", "No Requirement", "Same Day Dispatch", "Interested", "Negotiation", "Will Visit", "Quotation Sent", "Customer"] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

const aliases: Record<string, LeadStatus> = {
  "card pending": "Card Pending", new: "Card Pending", "new lead": "Card Pending", contacted: "Interested", interested: "Interested",
  "follow up": "Negotiation", "follow-up": "Negotiation", qualified: "Negotiation", negotiation: "Negotiation",
  "proposal sent": "Quotation Sent", "quotation sent": "Quotation Sent", won: "Customer", closed: "Customer", customer: "Customer",
  lost: "No Requirement", "no requirement": "No Requirement", "not interested": "No Requirement",
  "on hold": "Whenever Required", "whenever required": "Whenever Required", "same day dispatch": "Same Day Dispatch", "will visit": "Will Visit",
};

export function normalizeLeadStatus(status?: string | null): LeadStatus {
  return aliases[(status || "").trim().toLowerCase()] ?? "None";
}

export function isLeadStatus(status: unknown): status is LeadStatus {
  return typeof status === "string" && (LEAD_STATUSES as readonly string[]).includes(status);
}
