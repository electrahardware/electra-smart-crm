import { api } from "../lib/api";

import type {
  Followup,
} from "../types/followup";

export async function getTodayFollowups(): Promise<Followup[]> {

  return api<Followup[]>(
    "/leads/today-followups"
  );

}