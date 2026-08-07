import type { SearchResult } from "../contexts/SearchContext";
import { api } from "../lib/api";

export async function searchLeads(
  query: string
): Promise<SearchResult[]> {
  return api<SearchResult[]>(`/master-search?q=${encodeURIComponent(query)}`);
}
