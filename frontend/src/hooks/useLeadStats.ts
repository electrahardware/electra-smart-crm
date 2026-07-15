import { useMemo } from "react";

import type { Lead } from "../types/lead";

export interface LeadStats {
  totalLeads: number;
  hotLeads: number;
  warmLeads: number;
  coldLeads: number;
  overdueFollowups: number;
  todayFollowups: number;
  upcomingFollowups: number;
  expectedValue: number;
}

export const EMPTY_LEAD_STATS: LeadStats = {
  totalLeads: 0,
  hotLeads: 0,
  warmLeads: 0,
  coldLeads: 0,
  overdueFollowups: 0,
  todayFollowups: 0,
  upcomingFollowups: 0,
  expectedValue: 0,
};

function calculateLeadStats(
  filteredLeads: Lead[],
  today: string
): LeadStats {
  return {
    totalLeads: filteredLeads.length,
    hotLeads: filteredLeads.filter(
      (lead) => lead.priority === "Hot"
    ).length,
    warmLeads: filteredLeads.filter(
      (lead) => lead.priority === "Warm"
    ).length,
    coldLeads: filteredLeads.filter(
      (lead) => lead.priority === "Cold"
    ).length,
    todayFollowups: filteredLeads.filter(
      (lead) => lead.followupDate?.slice(0, 10) === today
    ).length,
    overdueFollowups: filteredLeads.filter(
      (lead) =>
        !!lead.followupDate &&
        lead.followupDate.slice(0, 10) < today
    ).length,
    upcomingFollowups: filteredLeads.filter(
      (lead) =>
        !!lead.followupDate &&
        lead.followupDate.slice(0, 10) > today
    ).length,
    expectedValue: filteredLeads.reduce(
      (total, lead) =>
        total + Number(lead.expectedValue || 0),
      0
    ),
  };
}

export function useLeadStats(
  filteredLeads: Lead[]
): LeadStats {
  const today = useMemo(
    () => new Date().toISOString().slice(0, 10),
    []
  );

  return useMemo(
    () => calculateLeadStats(filteredLeads, today),
    [filteredLeads, today]
  );
}
