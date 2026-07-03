const API = "http://localhost:5000/api/leads";

export async function getLeads() {
  const res = await fetch(API);
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

  return res.json();
}