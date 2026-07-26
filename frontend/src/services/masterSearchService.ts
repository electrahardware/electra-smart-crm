import axios from "axios";
import type { SearchResult } from "../contexts/SearchContext";

const API =
  `${import.meta.env.VITE_API_URL}/master-search`;

export async function searchLeads(
  query: string
): Promise<SearchResult[]> {
  const { data } = await axios.get<SearchResult[]>(API, {
    params: {
      q: query,
    },
  });

  return data;
}