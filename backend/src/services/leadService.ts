const API = "http://localhost:5000/api/leads";

export async function getLeads() {
  const res = await fetch(API);

  if (!res.ok) {
    throw new Error("Failed to fetch leads");
  }

  return res.json();
}

export async function getLead(id: number) {
  const res = await fetch(`${API}/${id}`);

  if (!res.ok) {
    throw new Error("Failed to fetch lead");
  }

  return res.json();
}

export async function saveLead(data: any) {
  const res = await fetch(API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json();

    const err: any = new Error(
      error.message || "Unable to save lead"
    );

    err.data = error;

    throw err;
  }

  return res.json();
}

export async function updateLead(
  id: number,
  data: any
) {
  const res = await fetch(`${API}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json();

    const err: any = new Error(
      error.message || "Unable to update lead"
    );

    err.data = error;

    throw err;
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

export async function getFollowupDashboard() {
  const res = await fetch(
    `${API}/followup/dashboard`
  );

  if (!res.ok) {
    throw new Error(
      "Failed to fetch follow-up dashboard"
    );
  }

  return res.json();
}