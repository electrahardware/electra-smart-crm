const API =
  "http://localhost:5000/api/leads";

import type {
  Followup,
} from "../types/followup";

export async function
getTodayFollowups() {

  const res =
    await fetch(
      `${API}/today-followups`
    );

  if (!res.ok) {

    throw new Error(
      "Unable to load followups."
    );

  }

  return await res.json() as Followup[];

}