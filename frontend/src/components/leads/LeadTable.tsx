import { useEffect, useMemo, useState } from "react";

import { deleteLead, getLead, getLeads } from "../../services/leadService";

import type { Lead } from "../../types/lead";

import { useLead } from "../../hooks/useLead";

import toast from "react-hot-toast";
import { isOwnerOrManager } from "../../utils/auth";
import { exportLeadsExcel } from "../../utils/exportLeadsExcel";
import FollowupDashboard from "./FollowupDashboard";
import LeadBulkActions from "./LeadBulkActions";
import LeadDetailsDrawer from "./LeadDetailsDrawer";
import LeadPagination from "./LeadPagination";
import LeadRow from "./LeadRow";
import LeadStats from "./LeadStats";
import LeadTableHeader from "./LeadTableHeader";
import LeadToolbar from "./LeadToolbar";

type LeadTableProps = {
  onEditLead?: () => void;
};

export default function LeadTable({ onEditLead }: LeadTableProps) {
  const canManage = isOwnerOrManager();

  const [leads, setLeads] = useState<Lead[]>([]);

  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState("All");

  const [ownerFilter, setOwnerFilter] = useState("All");

  const [priorityFilter, setPriorityFilter] = useState("All");

  const [stateFilter, setStateFilter] = useState("All");

  const [sourceFilter, setSourceFilter] = useState("All");

  const [cityFilter, setCityFilter] = useState<string[]>([]);

  const [fromDate, setFromDate] = useState("");

  const [toDate, setToDate] = useState("");

  const [followupFilter, setFollowupFilter] = useState("All");

  const [sortBy, setSortBy] = useState("latest");

  const [pageSize, setPageSize] = useState(10);

  const [currentPage, setCurrentPage] = useState(1);

  const [totalRecords, setTotalRecords] = useState(0);

  const { setLead, setEditingId } = useLead();

  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    loadLeads();

    const handler = async () => {
      await loadLeads();

      await refreshSelectedLead();
    };

    window.addEventListener("lead-imported", handler);

    window.addEventListener("lead-updated", handler);

    return () => {
      window.removeEventListener("lead-imported", handler);

      window.removeEventListener("lead-updated", handler);
    };
  }, [
    currentPage,
    pageSize,
    search,
    statusFilter,
    ownerFilter,
    priorityFilter,
    stateFilter,
    sourceFilter,
    cityFilter,
    fromDate,
    toDate,
    followupFilter,
  ]);

  async function loadLeads() {
    try {
      const response = await getLeads(
        currentPage,
        pageSize,
        search,
        statusFilter === "All" ? "" : statusFilter,
        ownerFilter === "All" ? "" : ownerFilter,
        priorityFilter === "All" ? "" : priorityFilter,
        stateFilter === "All" ? "" : stateFilter,
        sourceFilter === "All" ? "" : sourceFilter,
        cityFilter,
        fromDate,
        toDate,
        followupFilter === "All" ? "" : followupFilter,
      );
      setLeads(response.data);

      setTotalRecords(response.total);

      setSelectedLead((current) => {
        if (!current) {
          return null;
        }

        const updated = response.data.find((lead) => lead.id === current.id);

        return updated ?? null;
      });
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    setCurrentPage(1);
  }, [
    search,
    statusFilter,
    ownerFilter,
    priorityFilter,
    stateFilter,
    sourceFilter,
    cityFilter,
    followupFilter,
    fromDate,
    toDate,
    today,
  ]);

  const filteredLeads = leads;

  const sortedLeads = useMemo(() => {
    const rows = [...filteredLeads];

    switch (sortBy) {
      case "customer":
        rows.sort((a, b) => a.customerName.localeCompare(b.customerName));

        break;

      case "date":
        rows.sort((a, b) => {
          const dateA = (a.leadDate || a.createdAt || "").slice(0, 10);

          const dateB = (b.leadDate || b.createdAt || "").slice(0, 10);

          return dateB.localeCompare(dateA);
        });

        break;

      case "followup":
        rows.sort((a, b) =>
          (a.followupDate || "").localeCompare(b.followupDate || ""),
        );

        break;

      case "value":
        rows.sort(
          (a, b) => Number(b.expectedValue || 0) - Number(a.expectedValue || 0),
        );

        break;

      default: {
        rows.sort((a, b) => {
          const dateA = (a.leadDate || a.createdAt || "").slice(0, 10);

          const dateB = (b.leadDate || b.createdAt || "").slice(0, 10);

          return dateB.localeCompare(dateA);
        });

        break;
      }
    }

    return rows;
  }, [filteredLeads, sortBy]);

  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));

  const paginatedLeads = sortedLeads;

  const totalLeads = totalRecords;

  const hotLeads = filteredLeads.filter(
    (lead) => lead.priority === "Hot",
  ).length;

  const todayFollowups = filteredLeads.filter(
    (lead) =>
      !lead.followupCompleted && lead.followupDate?.slice(0, 10) === today,
  ).length;

  const overdueLeads = filteredLeads.filter(
    (lead) =>
      !lead.followupCompleted &&
      !!lead.followupDate &&
      lead.followupDate.slice(0, 10) < today,
  ).length;

  const upcomingLeads = filteredLeads.filter(
    (lead) =>
      !lead.followupCompleted &&
      !!lead.followupDate &&
      lead.followupDate.slice(0, 10) > today,
  ).length;

  const expectedValue = filteredLeads.reduce(
    (total, lead) => total + Number(lead.expectedValue || 0),
    0,
  );
  const dashboard = {
    overdue: overdueLeads,
    today: todayFollowups,
    upcoming: upcomingLeads,
    expectedValue,
  };
  async function handleDelete(id: number) {
    const ok = window.confirm("Are you sure you want to delete this lead?");

    if (!ok) {
      return;
    }

    try {
      await deleteLead(id);

      toast.success("Lead deleted successfully.");

      await loadLeads();

      setSelectedIds((prev) => prev.filter((item) => item !== id));

      if (selectedLead?.id === id) {
        setSelectedLead(null);
      }
    } catch (error) {
      console.error(error);

      toast.error("Unable to delete lead.");
    }
  }

  async function handleDeleteSelected() {
    if (selectedIds.length === 0) {
      return;
    }

    const ok = window.confirm(`Delete ${selectedIds.length} selected lead(s)?`);

    if (!ok) {
      return;
    }

    try {
      await Promise.all(selectedIds.map((id) => deleteLead(id)));

      toast.success(`${selectedIds.length} lead(s) deleted successfully.`);

      setSelectedIds([]);

      await loadLeads();
    } catch (error) {
      console.error(error);

      toast.error("Unable to delete selected leads.");
    }
  }

  function handleEdit(lead: Lead) {
    setSelectedLead(null);

    setEditingId(lead.id!);

    setLead({
      ...lead,
      products: Array.isArray(lead.products) ? lead.products : [],
      followupDate: lead.followupDate ?? "",
    });

    onEditLead?.();
  }

  async function refreshSelectedLead() {
    if (!selectedLead?.id) {
      return;
    }

    try {
      const latestLead = await getLead(selectedLead.id);

      setSelectedLead(latestLead);
    } catch (error) {
      console.error(error);
    }
  }

  function toggleLead(id: number) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  }

  function toggleAll() {
    if (
      paginatedLeads.length > 0 &&
      selectedIds.length === paginatedLeads.length
    ) {
      setSelectedIds([]);

      return;
    }

    setSelectedIds(paginatedLeads.map((lead) => lead.id!));
  }

  async function deleteSelected() {
    if (selectedIds.length === 0) {
      return;
    }

    const ok = window.confirm(`Delete ${selectedIds.length} selected lead(s)?`);

    if (!ok) {
      return;
    }

    try {
      await handleDeleteSelected();
    } catch (error) {
      console.error(error);

      toast.error("Unable to delete selected leads.");
    }
  }

  function exportSelected() {
    if (selectedIds.length === 0) {
      return;
    }

    alert("Export API will be connected in next step.");
  }

  function exportFilteredLeads() {
    if (sortedLeads.length === 0) {
      toast.error("No leads available to export.");

      return;
    }

    exportLeadsExcel(sortedLeads);

    toast.success(`${sortedLeads.length} lead(s) exported successfully.`);
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

      <div className="h-6" />
      <div className="bg-white rounded-2xl shadow border border-slate-200">
        {canManage && (
          <LeadBulkActions
            selectedCount={selectedIds.length}
            onDelete={deleteSelected}
            onExport={exportSelected}
            onClear={() => setSelectedIds([])}
          />
        )}

        <div className="border-b p-6">
          <h2 className="text-2xl font-bold">Saved Leads</h2>

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
          cityFilter={cityFilter}
          setCityFilter={setCityFilter}
          sourceFilter={sourceFilter}
          setSourceFilter={setSourceFilter}
          followupFilter={followupFilter}
          setFollowupFilter={setFollowupFilter}
          fromDate={fromDate}
          setFromDate={setFromDate}
          toDate={toDate}
          setToDate={setToDate}
        />

        <div className="max-h-[650px] overflow-auto">
          <table className="w-full border-separate border-spacing-0">
            <LeadTableHeader
              allSelected={
                paginatedLeads.length > 0 &&
                selectedIds.length === paginatedLeads.length
              }
              onToggleAll={toggleAll}
            />

            <tbody>
              {paginatedLeads.map((lead, index) => (
                <LeadRow
                  key={lead.id}
                  index={index}
                  lead={lead}
                  selected={selectedIds.includes(lead.id!)}
                  onToggle={() => toggleLead(lead.id!)}
                  onView={() => setSelectedLead(lead)}
                  onEdit={() => handleEdit(lead)}
                  onDelete={() => handleDelete(lead.id!)}
                />
              ))}
            </tbody>
          </table>
        </div>

        {leads.length === 0 && (
          <div className="p-12 text-center text-slate-500">No leads found.</div>
        )}

        {leads.length > 0 && (
          <div className="flex items-center justify-between border-t p-5">
            <LeadPagination
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={pageSize}
              totalRecords={totalRecords}
              setPageSize={setPageSize}
              setCurrentPage={setCurrentPage}
            />
          </div>
        )}
      </div>

      <LeadDetailsDrawer
        lead={selectedLead}
        onClose={() => setSelectedLead(null)}
        onEdit={handleEdit}
      />
    </>
  );
}
