import { api } from "../lib/api";

export interface DashboardData {

  totalLeads: number;

  todayFollowups: number;

  hotLeads: number;

  wonLeads: number;

  lostLeads: number;

  overdueFollowups: number;

  pipelineValue: number;

}

export async function getDashboard() {

  return api<DashboardData>(
    "/dashboard"
  );

}