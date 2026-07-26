import axios from "axios";

const API =
  `${import.meta.env.VITE_API_URL}/master-search`;

export async function getLeadDetails(id: number) {
  const { data } = await axios.get(`${API}/${id}`);

  return data;
}