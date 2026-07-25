import { api } from "../lib/api";
import type { Lead } from "../types/lead";

export async function getFollowups(
  filter: "today" | "overdue"
): Promise<Lead[]> {
  return api<Lead[]>(
    `/leads/followups?filter=${filter}`
  );
}

export async function getTodayFollowups(): Promise<Lead[]> {
  return getFollowups("today");
}