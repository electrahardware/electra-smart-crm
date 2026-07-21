import { api } from "../lib/api";

export interface CityWiseItem {
  city: string | null;
  _count: {
    city: number;
  };
}

export interface StateWiseItem {
  state: string | null;
  _count: {
    state: number;
  };
}

export interface OwnerWiseItem {
  leadOwner: string | null;
  _count: {
    leadOwner: number;
  };
}

export interface SourceWiseItem {
  leadSource: string | null;
  _count: {
    leadSource: number;
  };
}

export interface StatusWiseItem {
  status: string | null;
  _count: {
    status: number;
  };
}

export interface PriorityWiseItem {
  priority: string | null;
  _count: {
    priority: number;
  };
}

export interface AnalyticsResponse {
  totalLeads: number;

  newToday: number;
  hotLeads: number;
  warmLeads: number;
  coldLeads: number;

  overdue: number;
  todayFollowups: number;
  completedToday: number;

  monthlyLeads: unknown[];

  cityWise: CityWiseItem[];
  stateWise: StateWiseItem[];
  ownerWise: OwnerWiseItem[];

  sourceWise: SourceWiseItem[];
  statusWise: StatusWiseItem[];
  priorityWise: PriorityWiseItem[];
}

export async function getAnalytics(): Promise<AnalyticsResponse> {
  return api<AnalyticsResponse>("/analytics");
}