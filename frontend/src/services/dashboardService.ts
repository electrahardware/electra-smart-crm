import { api } from "../lib/api";

export interface DashboardData {
  totalLeads: number;

  todayFollowups: number;

  hotLeads: number;

  wonLeads: number;

  lostLeads: number;

  overdueFollowups: number;

  pipelineValue: number;

  recentLeads: {
    id: number;
    customerName: string;
    shopName: string | null;
    mobile: string;
    status: string | null;
    priority: string | null;
    createdAt: string;
  }[];
}

export async function getDashboard() {
  return api<DashboardData>("/dashboard");
}