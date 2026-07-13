import { api } from "../lib/api";
import type { Lead } from "../types/lead";

export type LeadResponse = Lead;

const API =
  `${import.meta.env.VITE_API_URL}/leads`;

export async function getLeads(): Promise<LeadResponse[]> {
  const res = await fetch(API);

  if (!res.ok) {
    throw new Error("Unable to load leads");
  }

  return res.json();
}

export async function getLead(
  id: number
): Promise<LeadResponse> {
  const res = await fetch(`${API}/${id}`);

  if (!res.ok) {
    throw new Error("Unable to load lead");
  }

  return res.json();
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

  if (!res.ok) {
    throw new Error("Unable to update lead");
  }

  return res.json();
}

export async function deleteLead(id: number) {
  const res = await fetch(`${API}/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error("Unable to delete lead");
  }

  

  return res.json();
}

export async function markFollowupDone(
  id: number
) {
  const res = await fetch(
    `${API}/${id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify({
        followupCompleted: true,
        followupCompletedAt:
          new Date().toISOString(),
      }),
    }
  );

  return await res.json();
}

export async function getLeadNotes(
  leadId: number
) {
  const res = await fetch(
    `${API}/${leadId}/notes`
  );

  if (!res.ok) {
    throw new Error("Unable to load notes");
  }

  return res.json();
}

export async function addLeadNote(
  leadId: number,
  note: string
) {
  const res = await fetch(
    `${API}/${leadId}/notes`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        note,
      }),
    }
  );

  if (!res.ok) {
    throw new Error("Unable to save note");
  }

  return res.json();
}

export async function deleteLeadNote(
  noteId: number
) {
  const res = await fetch(
    `${API}/notes/${noteId}`,
    {
      method: "DELETE",
    }
  );

  if (!res.ok) {
    throw new Error("Unable to delete note");
  }

  return res.json();
}

export async function deleteMultipleLeads(
  ids: number[]
) {

  const res = await fetch(
    `${API}/leads`,
    {
      method: "DELETE",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        ids,
      }),
    }
  );

  if (!res.ok) {

    throw new Error(
      "Unable to delete selected leads."
    );

  }

  return res.json();

}