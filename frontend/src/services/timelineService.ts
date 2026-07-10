import { api } from "../lib/api";

import type {
  Timeline,
} from "../types/timeline";

export async function getTimeline(
  leadId: number
) {

  return api<Timeline[]>(
    `/timeline/${leadId}`
  );

}