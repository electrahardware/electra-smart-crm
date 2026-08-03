import { useMemo } from "react";

import type { Lead } from "../types/lead";

export type LeadSortBy =
  | "latest"
  | "customer"
  | "date"
  | "followup"
  | "value";

export interface LeadFilters {
  search: string;
  statusFilter: string;
  ownerFilter: string;
  stateFilter: string;
  sourceFilter: string;
  cityFilter: string[];
  followupFilter: string;
  fromDate: string;
  toDate: string;
}

export const DEFAULT_LEAD_FILTERS: LeadFilters = {
  search: "",
  statusFilter: "All",
  ownerFilter: "All",
  stateFilter: "All",
  sourceFilter: "All",
  cityFilter: [],
  followupFilter: "All",
  fromDate: "",
  toDate: "",
};

interface UseLeadFiltersParams {
  leads: Lead[];
  filters: LeadFilters;
  sortBy: LeadSortBy;
}

interface UseLeadFiltersResult {
  filteredLeads: Lead[];
  sortedLeads: Lead[];
}

function getLeadDateValue(lead: Lead): string {
  return (lead.leadDate || lead.createdAt || "").slice(0, 10);
}

function matchesSearch(lead: Lead, keyword: string): boolean {
  if (!keyword) {
    return true;
  }

  const fields = [
    lead.customerName,
    lead.mobile,
    lead.secondaryMobile,
    lead.whatsapp,
    lead.shopName,
    lead.email,
    lead.gst,
    lead.area,
    lead.district,
    lead.city,
    lead.state,
    lead.leadOwner,
    lead.leadSource,
    lead.status,
  ];

  return fields.some((field) =>
    (field || "").toLowerCase().includes(keyword)
  );
}

function filterLeads(
  leads: Lead[],
  filters: LeadFilters,
  today: string
): Lead[] {
  const keyword = filters.search.toLowerCase();

  return leads.filter((lead) => {
    const matchesStatus =
      filters.statusFilter === "All" ||
      lead.status === filters.statusFilter;

    const matchesOwner =
      filters.ownerFilter === "All" ||
      lead.leadOwner === filters.ownerFilter;

    const matchesState =
      filters.stateFilter === "All" ||
      lead.state === filters.stateFilter;

    const matchesSource =
      filters.sourceFilter === "All" ||
      lead.leadSource === filters.sourceFilter;

    const matchesCity =
      filters.cityFilter.length === 0 ||
      filters.cityFilter.includes(lead.city || "");

    const matchesDate = (() => {
      if (!filters.fromDate && !filters.toDate) {
        return true;
      }

      const date = getLeadDateValue(lead);

      if (filters.fromDate && date < filters.fromDate) {
        return false;
      }

      if (filters.toDate && date > filters.toDate) {
        return false;
      }

      return true;
    })();

    const matchesFollowup = (() => {
      if (filters.followupFilter === "All") {
        return true;
      }

      if (!lead.followupDate) {
        return false;
      }

      const date = lead.followupDate.slice(0, 10);

      if (filters.followupFilter === "Today") {
        return date === today;
      }

      if (filters.followupFilter === "Overdue") {
        return date < today;
      }

      if (filters.followupFilter === "Upcoming") {
        return date > today;
      }

      return true;
    })();

    return (
      matchesSearch(lead, keyword) &&
      matchesStatus &&
      matchesOwner &&
      matchesState &&
      matchesSource &&
      matchesCity &&
      matchesDate &&
      matchesFollowup
    );
  });
}

function sortLeads(
  leads: Lead[],
  sortBy: LeadSortBy
): Lead[] {
  const rows = [...leads];

  switch (sortBy) {
    case "customer":
      rows.sort((a, b) =>
        a.customerName.localeCompare(b.customerName)
      );
      break;

    case "date":
      rows.sort((a, b) =>
        getLeadDateValue(b).localeCompare(getLeadDateValue(a))
      );
      break;

    case "followup":
      rows.sort((a, b) =>
        (a.followupDate || "").localeCompare(b.followupDate || "")
      );
      break;

    case "value":
      rows.sort(
        (a, b) =>
          Number(b.expectedValue || 0) -
          Number(a.expectedValue || 0)
      );
      break;

    default:
      rows.sort((a, b) =>
        getLeadDateValue(b).localeCompare(getLeadDateValue(a))
      );
      break;
  }

  return rows;
}

export function useLeadFilters({
  leads,
  filters,
  sortBy,
}: UseLeadFiltersParams): UseLeadFiltersResult {
  const today = useMemo(
    () => new Date().toISOString().slice(0, 10),
    []
  );

  const filteredLeads = useMemo(
    () => filterLeads(leads, filters, today),
    [leads, filters, today]
  );

  const sortedLeads = useMemo(
    () => sortLeads(filteredLeads, sortBy),
    [filteredLeads, sortBy]
  );

  return {
    filteredLeads,
    sortedLeads,
  };
}
