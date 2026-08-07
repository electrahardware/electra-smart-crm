import { api } from "../lib/api";

export async function getLeadDetails(id: number) {
  return api(`/master-search/${id}`);
}
