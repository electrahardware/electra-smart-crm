export const LEAD_STATUSES = ["New", "Contacted", "Follow-up", "Quotation Sent", "Negotiation", "Won", "Lost", "On Hold", "Not Interested"] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

const aliases: Record<string, LeadStatus> = {
  new: "New", "new lead": "New", contacted: "Contacted", "follow up": "Follow-up", "follow-up": "Follow-up",
  qualified: "Negotiation", negotiation: "Negotiation", "proposal sent": "Quotation Sent", "quotation sent": "Quotation Sent",
  won: "Won", closed: "Won", customer: "Won", lost: "Lost", "no requirement": "Not Interested",
  "not interested": "Not Interested", "on hold": "On Hold", "whenever required": "On Hold",
};

export function normalizeLeadStatus(status?: string | null): LeadStatus {
  return aliases[(status || "").trim().toLowerCase()] ?? "New";
}

export function isLeadStatus(status: unknown): status is LeadStatus {
  return typeof status === "string" && (LEAD_STATUSES as readonly string[]).includes(status);
}
