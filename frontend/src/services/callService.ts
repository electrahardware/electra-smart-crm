const API = "http://localhost:5000/api/calls";

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
  const res = await fetch(`${API}/${leadId}`);

  if (!res.ok) {
    throw new Error("Failed to load calls");
  }

  return res.json();
}

export async function addLeadCall(
  leadId: number,
  data: {
    callType: string;
    duration?: number;
    remarks?: string;
    nextFollowup?: string;
  }
) {
  const res = await fetch(`${API}/${leadId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error("Unable to save call");
  }

  return res.json();
}

export async function deleteLeadCall(
  callId: number
) {
  const res = await fetch(`${API}/${callId}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error("Unable to delete call");
  }

  return res.json();
}