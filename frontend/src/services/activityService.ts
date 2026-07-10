import { api } from "../lib/api";

import type {
  Activity,
} from "../types/activity";

export async function getActivities() {

  return api<Activity[]>(
    "/activity"
  );

}