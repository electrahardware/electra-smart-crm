import { api } from "../lib/api";
import type { Lead } from "../types/lead";

export type LeadResponse = Lead;

const API =
  `${import.meta.env.VITE_API_URL}/leads`;

export async function getLeads(): Promise<LeadResponse[]> {

  return api<LeadResponse[]>(

    "/leads"

  );

}

export async function getLead(
  id: number
): Promise<LeadResponse> {

  return api<LeadResponse>(

    `/leads/${id}`

  );

}

export async function saveLead(
  data: Lead
) {

  return api<Lead>(

    "/leads",

    {

      method: "POST",

      body: JSON.stringify(data),

    }

  );

}

export async function updateLead(
  id: number,
  data: Lead
) {

  return api<Lead>(

    `/leads/${id}`,

    {

      method: "PUT",

      body: JSON.stringify(data),

    }

  );

}

export async function deleteLead(
  id: number
) {

  return api(

    `/leads/${id}`,

    {

      method: "DELETE",

    }

  );

}

export async function markFollowupDone(
  id: number
) {

  return api(

    `/leads/${id}`,

    {

      method: "PUT",

      body: JSON.stringify({

        followupCompleted: true,

        followupCompletedAt:
          new Date().toISOString(),

      }),

    }

  );

}

export async function getLeadNotes(
  leadId: number
) {

  return api(

    `/leads/${leadId}/notes`

  );

}

export async function addLeadNote(
  leadId: number,
  note: string
) {

  return api(

    `/leads/${leadId}/notes`,

    {

      method: "POST",

      body: JSON.stringify({

        note,

      }),

    }

  );

}

export async function deleteLeadNote(
  noteId: number
) {

  return api(

    `/leads/notes/${noteId}`,

    {

      method: "DELETE",

    }

  );

}

export async function deleteMultipleLeads(
  ids: number[]
) {

  return api(

    "/leads",

    {

      method: "DELETE",

      body: JSON.stringify({

        ids,

      }),

    }

  );

}