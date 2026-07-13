import { api } from "../lib/api";
import type { DuplicateLead } from "../types/duplicate";

export async function getDuplicates(): Promise<DuplicateLead[]> {
  return api<DuplicateLead[]>("/duplicates");
}