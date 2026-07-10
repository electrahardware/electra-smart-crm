const API =
  "http://localhost:5000/api/duplicates";

import type {
  DuplicateLead,
} from "../types/duplicate";

export async function
getDuplicates() {

  const res =
    await fetch(API);

  if (!res.ok) {

    throw new Error(
      "Unable to load duplicate leads."
    );

  }

  return await res.json() as DuplicateLead[];

}