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

export interface MonthlyLeadItem {
  month: string;
  count: number;
}

export interface AnalyticsResponse {
  totalLeads: number;

  newToday: number;
  yesterdayLeads: number;
  weekLeads: number;
  monthLeads: number;

  overdue: number;
  todayFollowups: number;
  completedToday: number;

  monthlyLeads: MonthlyLeadItem[];

  cityWise: CityWiseItem[];
  stateWise: StateWiseItem[];
  ownerWise: OwnerWiseItem[];

  sourceWise: SourceWiseItem[];
  statusWise: StatusWiseItem[];
  salesExecutivePerformance: {
    user: string;
    today: number;
    week: number;
    month: number;
    total: number;
  }[];
  mostActiveToday: {
    user: string;
    today: number;
    week: number;
    month: number;
    total: number;
  } | null;
  todaysEditActivity: {
    time: string;
    user: string | null;
    leadName: string;
  }[];
}

export async function getAnalytics(): Promise<AnalyticsResponse> {
  return api<AnalyticsResponse>("/analytics");
}
