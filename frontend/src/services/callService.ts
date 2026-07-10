import { api } from "../lib/api";

export interface LeadCall {
  id: number;
  leadId: number;
  callType: string;
  duration?: number;
  remarks?: string;
  nextFollowup?: string;
  createdAt: string;
}

export async function getLeadCalls(
  leadId: number
): Promise<LeadCall[]> {
  return api<LeadCall[]>(`/calls/${leadId}`);
}

export async function addLeadCall(
  leadId: number,
  data: {
    callType: string;
    duration?: number;
    remarks?: string;
    nextFollowup?: string;
  }
): Promise<LeadCall> {
  return api<LeadCall>("/calls", {
    method: "POST",
    body: JSON.stringify({
      leadId,
      ...data,
    }),
  });
}

export async function deleteLeadCall(
  id: number
): Promise<void> {
  return api<void>(`/calls/${id}`, {
    method: "DELETE",
  });
}