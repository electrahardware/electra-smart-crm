import axios from "axios";
import type { SearchResult } from "../contexts/SearchContext";

const API = "http://localhost:5000/api/master-search";

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