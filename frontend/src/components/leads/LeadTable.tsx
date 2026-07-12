import { useEffect, useMemo, useState } from "react";

import {
  getLeads,
  deleteLead,
} from "../../services/leadService";

import type { Lead } from "../../types/lead";

import { useLead } from "../../hooks/useLead";

import StatusBadge from "./StatusBadge";
import PriorityBadge from "./PriorityBadge";
import LeadDetailsDrawer from "./LeadDetailsDrawer";
import FollowupDashboard from "./FollowupDashboard";
import TodayFollowupList from "./TodayFollowupList";
import toast from "react-hot-toast";
import LeadSummaryCards from "./LeadSummaryCards";
import LeadToolbar from "./LeadToolbar";
import LeadPagination from "./LeadPagination";
import LeadBulkActions from "./LeadBulkActions";
import LeadRow from "./LeadRow";
import LeadTableHeader from "./LeadTableHeader";
import LeadStats from "./LeadStats";

export default function LeadTable() {

  const [leads, setLeads] =
    useState<Lead[]>([]);

  const [selectedLead, setSelectedLead] =
    useState<Lead | null>(null);

  const [selectedIds, setSelectedIds] =
    useState<number[]>([]);

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("All");

  const [ownerFilter, setOwnerFilter] =
    useState("All");

   const [priorityFilter, setPriorityFilter] =
  useState("All");

const [stateFilter, setStateFilter] =
  useState("All");

const [sourceFilter, setSourceFilter] =
  useState("All"); 

  const [followupFilter, setFollowupFilter] =
    useState("All");

  const [sortBy, setSortBy] =
    useState("latest");

  const [pageSize, setPageSize] =
    useState(10);

  const [currentPage, setCurrentPage] =
    useState(1);

  const {
    setLead,
    setEditingId,
  } = useLead();

  const today =
    new Date()
      .toISOString()
      .slice(0, 10); 
        useEffect(() => {
    loadLeads();

    const handler = () => {
      loadLeads();
    };

    window.addEventListener(
      "lead-imported",
      handler
    );

    return () => {
      window.removeEventListener(
        "lead-imported",
        handler
      );
    };
  }, []);

  async function loadLeads() {
    try {
      const data = await getLeads();

      setLeads(data);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    setCurrentPage(1);
  }, [
  leads,
  search,
  statusFilter,
  ownerFilter,
  priorityFilter,
  stateFilter,
  sourceFilter,
  followupFilter,
  today,
]);

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {

      const keyword =
        search.toLowerCase();

      const matchesSearch =

  lead.customerName
    .toLowerCase()
    .includes(keyword) ||

  lead.mobile
    .toLowerCase()
    .includes(keyword) ||

  (lead.secondaryMobile || "")
    .toLowerCase()
    .includes(keyword) ||

  (lead.whatsapp || "")
    .toLowerCase()
    .includes(keyword) ||

  (lead.shopName || "")
    .toLowerCase()
    .includes(keyword) ||

  (lead.email || "")
    .toLowerCase()
    .includes(keyword) ||

  (lead.gst || "")
    .toLowerCase()
    .includes(keyword) ||

  (lead.area || "")
    .toLowerCase()
    .includes(keyword) ||

  (lead.district || "")
    .toLowerCase()
    .includes(keyword) ||

  (lead.state || "")
    .toLowerCase()
    .includes(keyword) ||

  (lead.leadOwner || "")
    .toLowerCase()
    .includes(keyword) ||

  (lead.leadSource || "")
    .toLowerCase()
    .includes(keyword) ||

  (lead.status || "")
    .toLowerCase()
    .includes(keyword) ||

  (lead.priority || "")
    .toLowerCase()
    .includes(keyword);

      const matchesStatus =
        statusFilter === "All"
          ? true
          : lead.status === statusFilter;

      const matchesOwner =
        ownerFilter === "All"
          ? true
          : lead.leadOwner === ownerFilter;

      const matchesPriority =
  priorityFilter === "All"
    ? true
    : lead.priority ===
      priorityFilter;

const matchesState =
  stateFilter === "All"
    ? true
    : lead.state ===
      stateFilter;

const matchesSource =
  sourceFilter === "All"
    ? true
    : lead.leadSource ===
      sourceFilter;

      const matchesFollowup = (() => {

        if (followupFilter === "All") {
          return true;
        }

        if (!lead.followupDate) {
          return false;
        }

        const date =
          lead.followupDate.slice(0, 10);

        if (
          followupFilter === "Today"
        ) {
          return date === today;
        }

        if (
          followupFilter === "Overdue"
        ) {
          return date < today;
        }

        if (
          followupFilter === "Upcoming"
        ) {
          return date > today;
        }

        return true;

      })();

      return (
  matchesSearch &&
  matchesStatus &&
  matchesOwner &&
  matchesPriority &&
  matchesState &&
  matchesSource &&
  matchesFollowup
);

    });
  }, [
    leads,
    search,
    statusFilter,
    ownerFilter,
    followupFilter,
    today,
    priorityFilter,
stateFilter,
sourceFilter,
  ]);
    const sortedLeads = useMemo(() => {

    const rows = [...filteredLeads];

    switch (sortBy) {

      case "customer":

        rows.sort((a, b) =>
          a.customerName.localeCompare(
            b.customerName
          )
        );

        break;

      case "followup":

        rows.sort((a, b) =>
          (a.followupDate || "")
            .localeCompare(
              b.followupDate || ""
            )
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

        rows.sort(
          (a, b) =>
            (b.id || 0) -
            (a.id || 0)
        );

    }

    return rows;

  }, [
    filteredLeads,
    sortBy,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      sortedLeads.length / pageSize
    )
  );

  const paginatedLeads =
    sortedLeads.slice(
      (currentPage - 1) * pageSize,
      currentPage * pageSize
    );

  const totalLeads =
    filteredLeads.length;

  const hotLeads =
    filteredLeads.filter(
      (lead) =>
        lead.priority === "Hot"
    ).length;

  const todayFollowups =
    filteredLeads.filter(
      (lead) =>
        lead.followupDate?.slice(0, 10) ===
        today
    ).length;

  const overdueLeads =
    filteredLeads.filter(
      (lead) =>
        lead.followupDate &&
        lead.followupDate.slice(0, 10) <
          today
    ).length;

  const upcomingLeads =
    filteredLeads.filter(
      (lead) =>
        lead.followupDate &&
        lead.followupDate.slice(0, 10) >
          today
    ).length;

  const expectedValue =
    filteredLeads.reduce(
      (total, lead) =>
        total +
        Number(
          lead.expectedValue || 0
        ),
      0
    );
    const dashboard = {
  overdue: overdueLeads,
  today: todayFollowups,
  upcoming: upcomingLeads,
  expectedValue,
};
      async function handleDelete(
    id: number
  ) {

    const ok = window.confirm(
      "Are you sure you want to delete this lead?"
    );

    if (!ok) {
      return;
    }

    try {

      await deleteLead(id);

      toast.success(
  "Lead deleted successfully."
);

      await loadLeads();

      setSelectedIds((prev) =>
        prev.filter(
          (item) => item !== id
        )
      );

      if (
        selectedLead?.id === id
      ) {
        setSelectedLead(null);
      }

    } catch (error) {

      console.error(error);

      toast.error(
  "Unable to delete lead."
);

    }

  }

  async function handleDeleteSelected() {

    if (selectedIds.length === 0) {
      return;
    }

    const ok = window.confirm(
      `Delete ${selectedIds.length} selected lead(s)?`
    );

    if (!ok) {
      return;
    }

    try {

      await Promise.all(
        selectedIds.map((id) =>
          deleteLead(id)
        )
      );

      toast.success(
  `${selectedIds.length} lead(s) deleted successfully.`
);

      setSelectedIds([]);

      await loadLeads();

    } catch (error) {

      console.error(error);

      toast.error(
  "Unable to delete selected leads."
);

    }

  }

  function handleEdit(
    lead: Lead
  ) {

    setEditingId(lead.id!);

    setLead({
      ...lead,
      products:
        Array.isArray(
          lead.products
        )
          ? lead.products
          : [],
      followupDate:
        lead.followupDate ?? "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

  }

  function toggleLead(
    id: number
  ) {

    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter(
            (item) =>
              item !== id
          )
        : [...prev, id]
    );

  }

  function toggleAll() {

    if (
      paginatedLeads.length > 0 &&
      selectedIds.length ===
        paginatedLeads.length
    ) {

      setSelectedIds([]);

      return;

    }


    setSelectedIds(
      paginatedLeads.map(
        (lead) => lead.id!
      )
    );

  }

  function deleteSelected() {

  if (
    selectedIds.length === 0
  ) {
    return;
  }

  if (
    !window.confirm(
      `Delete ${selectedIds.length} selected lead(s)?`
    )
  ) {
    return;
  }

  alert(
    "Bulk Delete API will be connected in next step."
  );

}

function exportSelected() {

  if (
    selectedIds.length === 0
  ) {
    return;
  }

  alert(
    "Export API will be connected in next step."
  );

}

  return (
    <> 
    <FollowupDashboard
  overdue={dashboard.overdue}
  today={dashboard.today}
  upcoming={dashboard.upcoming}
  expectedValue={dashboard.expectedValue}
/>

<div className="h-6" />
<TodayFollowupList
  leads={filteredLeads}
  onRefresh={loadLeads}
/>

<div className="h-6" />
          <div className="bg-white rounded-2xl shadow border border-slate-200">

        <LeadBulkActions
  selectedCount={selectedIds.length}
  onDelete={deleteSelected}
  onExport={exportSelected}
  onClear={() =>
    setSelectedIds([])
  }
/>

        <div className="border-b p-6">

          <h2 className="text-2xl font-bold">
            Saved Leads
          </h2>

          <p className="mt-1 text-slate-500">
            Manage all customer leads from one place.
          </p>

        </div>

        <LeadStats
  totalLeads={totalLeads}
  hotLeads={hotLeads}
  todayFollowups={todayFollowups}
  expectedValue={expectedValue}
  overdueLeads={overdueLeads}
  upcomingLeads={upcomingLeads}
/>

        <LeadToolbar
  leads={leads}

  search={search}
  setSearch={setSearch}

  statusFilter={statusFilter}
  setStatusFilter={setStatusFilter}

  ownerFilter={ownerFilter}
  setOwnerFilter={setOwnerFilter}

  priorityFilter={priorityFilter}
  setPriorityFilter={setPriorityFilter}

  stateFilter={stateFilter}
  setStateFilter={setStateFilter}

  sourceFilter={sourceFilter}
  setSourceFilter={setSourceFilter}

  followupFilter={followupFilter}
  setFollowupFilter={setFollowupFilter}
/>

        <div className="max-h-[650px] overflow-auto">

          <table className="w-full">

  <LeadTableHeader
  allSelected={
    paginatedLeads.length > 0 &&
    selectedIds.length ===
      paginatedLeads.length
  }
  onToggleAll={toggleAll}
/>

  <tbody>

    {paginatedLeads.map((lead) => (

  <LeadRow
    key={lead.id}
    lead={lead}
    selected={selectedIds.includes(
      lead.id!
    )}
    onToggle={() =>
      toggleLead(lead.id!)
    }
    onView={() =>
      setSelectedLead(lead)
    }
    onEdit={() =>
      handleEdit(lead)
    }
    onDelete={() =>
      handleDelete(
        lead.id!
      )
    }
  />

))}

  </tbody>

</table>

</div>
        

                {filteredLeads.length === 0 && (

          <div className="p-12 text-center text-slate-500">

            No leads found.

          </div>

        )}

        {filteredLeads.length > 0 && (

          <div className="flex items-center justify-between border-t p-5">

            <LeadPagination
  currentPage={currentPage}
  totalPages={totalPages}
  pageSize={pageSize}
  setPageSize={setPageSize}
  setCurrentPage={setCurrentPage}
/>
          </div>

                )}

      </div>

      <LeadDetailsDrawer
        lead={selectedLead}
        onClose={() =>
          setSelectedLead(null)
        }
      />

    </>
  );
}
