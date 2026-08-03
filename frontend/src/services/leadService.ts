import { api } from "../lib/api";
import type { Lead } from "../types/lead";

export interface LeadListResponse {
  data: Lead[];
  total: number;
  page: number;
  limit: number;
}

export interface Note {
  id: number;

  note: string;

  createdAt: string;

  createdBy?: string;
}

const API = `${import.meta.env.VITE_API_URL}/leads`;

export async function getLeads(
  page = 1,
  limit = 50,
  search = "",
  status = "",
  owner = "",
  state = "",
  source = "",
  cities: string[] = [],
  fromDate = "",
  toDate = "",
  followup = "",
): Promise<LeadListResponse> {
  const params = new URLSearchParams();

  params.set("page", String(page));
  params.set("limit", String(limit));

  if (search) params.set("search", search);
  if (status) params.set("status", status);
  if (owner) params.set("owner", owner);
  if (state) params.set("state", state);
  if (source) params.set("source", source);

  if (cities.length) {
    params.set("cities", cities.join(","));
  }

  if (fromDate) {
    params.set("fromDate", fromDate);
  }

  if (toDate) {
    params.set("toDate", toDate);
  }

  if (followup) {
    params.set("followup", followup);
  }

  if (limit === 0) params.set("all", "true");

  return api(`/leads?${params.toString()}`);
}

export async function getLead(id: number): Promise<Lead> {
  return api<Lead>(`/leads/${id}`);
}

export async function saveLead(data: Lead) {
  return api<Lead>("/leads", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateLead(id: number, data: Lead) {
  return api<Lead>(`/leads/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteLead(id: number) {
  return api<void>(`/leads/${id}`, {
    method: "DELETE",
  });
}

export async function markFollowupDone(id: number) {
  return api<Lead>(`/leads/${id}`, {
    method: "PUT",
    body: JSON.stringify({
      followupCompleted: true,
      followupCompletedAt: new Date().toISOString(),
    }),
  });
}

export async function completeFollowup(
  id: number,
  data: {
    note: string;
    followupDate?: string | null;
    followupTime?: string | null;
    status: string;
  },
) {
  return api<{ success: boolean }>(`/leads/${id}/complete-followup`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getLeadNotes(leadId: number): Promise<Note[]> {
  return api<Note[]>(`/leads/${leadId}/notes`);
}

export async function addLeadNote(leadId: number, note: string): Promise<Note> {
  return api<Note>(`/leads/${leadId}/notes`, {
    method: "POST",
    body: JSON.stringify({
      note,
    }),
  });
}

export async function deleteLeadNote(noteId: number): Promise<void> {
  return api<void>(`/leads/notes/${noteId}`, {
    method: "DELETE",
  });
}

export async function deleteMultipleLeads(ids: number[]): Promise<{
  success: boolean;
  message: string;
}> {
  return api("/leads", {
    method: "DELETE",
    body: JSON.stringify({
      ids,
    }),
  });
}

export async function createQuickLead(data: {
  mobile: string;
  leadOwner: string;
}) {
  return api("/leads/quick", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function createQuickBulkLead(data: {
  numbers: string[];
  leadOwner: string;
}) {
  return api<{
    created: number;

    duplicates: number;

    invalid: number;
  }>("/leads/quick-bulk", {
    method: "POST",

    body: JSON.stringify(data),
  });
}
