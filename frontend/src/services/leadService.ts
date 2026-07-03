import type { Lead } from "../types/lead";
export type LeadResponse = Lead;

const API = "http://localhost:5000/api/leads";

export async function getLeads(): Promise<LeadResponse[]> {

  const res = await fetch(API);

  return await res.json();

}

export async function getLead(
  id: number
): Promise<LeadResponse> {
  const res = await fetch(`${API}/${id}`);
  return await res.json();
}

export async function saveLead(data: Lead) {
  const res = await fetch(API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await res.json();

  console.log("STATUS:", res.status);
  console.log("RESULT:", result);

  if (!res.ok) {

  const error: any = new Error(
    result.message || "Save Failed"
  );

  error.data = result;

  throw error;

}

  return result;
}

export async function updateLead(
  id: number,
  data: Lead
) {
  const res = await fetch(`${API}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return await res.json();
}

export async function deleteLead(id: number) {
  const res = await fetch(`${API}/${id}`, {
    method: "DELETE",
  });

  return await res.json();
}