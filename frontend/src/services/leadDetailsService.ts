import axios from "axios";

const API = "http://localhost:5000/api/master-search";

export async function getLeadDetails(id: number) {
  const { data } = await axios.get(`${API}/${id}`);

  return data;
}