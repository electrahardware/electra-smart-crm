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
    search,
    statusFilter,
    ownerFilter,
    followupFilter,
    sortBy,
    pageSize,
  ]);

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {

      const keyword =
        search.toLowerCase();

      const matchesSearch =
        lead.customerName
          .toLowerCase()
          .includes(keyword) ||

        lead.mobile.includes(keyword) ||

        (lead.shopName || "")
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

      alert(
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

      setSelectedIds([]);

      await loadLeads();

    } catch (error) {

      console.error(error);

      alert(
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

        {selectedIds.length > 0 && (

          <div className="flex items-center justify-between border-b bg-red-50 px-6 py-4">

            <div className="font-semibold text-red-700">
              {selectedIds.length} lead(s) selected
            </div>

            <button
              onClick={handleDeleteSelected}
              className="rounded-xl bg-red-600 px-5 py-2 font-semibold text-white hover:bg-red-700"
            >
              🗑 Delete Selected
            </button>

          </div>

        )}

        <div className="border-b p-6">

          <h2 className="text-2xl font-bold">
            Saved Leads
          </h2>

          <p className="mt-1 text-slate-500">
            Manage all customer leads from one place.
          </p>

        </div>

        <div className="grid grid-cols-6 gap-4 border-b p-6">

          <SummaryCard
            title="Total Leads"
            value={totalLeads}
            color="blue"
          />

          <SummaryCard
            title="Hot Leads"
            value={hotLeads}
            color="red"
          />

          <SummaryCard
            title="Today's Follow-up"
            value={todayFollowups}
            color="green"
          />

          <SummaryCard
            title="Expected Value"
            value={`₹ ${expectedValue.toLocaleString()}`}
            color="yellow"
          />

          <SummaryCard
            title="Overdue"
            value={overdueLeads}
            color="orange"
          />

          <SummaryCard
            title="Upcoming"
            value={upcomingLeads}
            color="cyan"
          />

        </div>

        <div className="border-b p-6 space-y-4">

          <input
            type="text"
            placeholder="🔍 Search by Customer, Shop or Mobile..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
          />

          <div className="grid grid-cols-3 gap-4">

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(
                  e.target.value
                )
              }
              className="rounded-xl border border-slate-300 px-4 py-3"
            >
              <option value="All">All Status</option>
              <option value="New">New</option>
              <option value="Follow-up">Follow-up</option>
              <option value="Quotation Sent">Quotation Sent</option>
              <option value="Won">Won</option>
              <option value="Lost">Lost</option>
            </select>

            <select
              value={ownerFilter}
              onChange={(e) =>
                setOwnerFilter(
                  e.target.value
                )
              }
              className="rounded-xl border border-slate-300 px-4 py-3"
            >
              <option value="All">
                All Owners
              </option>

              {[
                ...new Set(
                  leads
                    .map((lead) => lead.leadOwner)
                    .filter(Boolean)
                ),
              ].map((owner) => (
                <option
                  key={owner}
                  value={owner}
                >
                  {owner}
                </option>
              ))}

            </select>

            <select
              value={followupFilter}
              onChange={(e) =>
                setFollowupFilter(
                  e.target.value
                )
              }
              className="rounded-xl border border-slate-300 px-4 py-3"
            >
              <option value="All">All Follow-ups</option>
              <option value="Today">Today</option>
              <option value="Overdue">Overdue</option>
              <option value="Upcoming">Upcoming</option>
            </select>

          </div>

        </div>

        <div className="max-h-[650px] overflow-auto">

          <table className="w-full">

  <thead className="sticky top-0 z-10 bg-slate-100">

    <tr>

      <th className="p-3">

        <input
          type="checkbox"
          checked={
            paginatedLeads.length > 0 &&
            selectedIds.length ===
              paginatedLeads.length
          }
          onChange={toggleAll}
        />

      </th>

      <th className="p-3 text-left">
        Customer
      </th>

      <th className="p-3 text-left">
        Mobile
      </th>

      <th className="p-3 text-left">
        Shop
      </th>

      <th className="p-3 text-left">
        Status
      </th>

      <th className="p-3 text-left">
        Owner
      </th>

      <th className="p-3 text-left">
        Priority
      </th>

      <th className="p-3 text-left">
        Actions
      </th>

    </tr>

  </thead>

  <tbody>

    {paginatedLeads.map((lead) => (

      <tr
        key={lead.id}
        className="border-t hover:bg-slate-50"
      >

        <td className="p-3">

          <input
            type="checkbox"
            checked={selectedIds.includes(
              lead.id!
            )}
            onChange={() =>
              toggleLead(lead.id!)
            }
          />

        </td>

        <td className="p-3 font-medium">
          {lead.customerName}
        </td>

        <td className="p-3">
          {lead.mobile}
        </td>

        <td className="p-3">
          {lead.shopName || "-"}
        </td>

        <td className="p-3">
          <StatusBadge
            status={lead.status}
          />
        </td>

        <td className="p-3">
          {lead.leadOwner || "-"}
        </td>

        <td className="p-3">
          <PriorityBadge
            priority={lead.priority}
          />
        </td>

        <td className="p-3">

          <div className="flex items-center gap-2">

            <a
              href={`tel:${lead.mobile}`}
              className="rounded-lg p-2 hover:bg-blue-100"
              title="Call"
            >
              📞
            </a>

            <a
              href={`https://wa.me/91${lead.mobile}`}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg p-2 hover:bg-green-100"
              title="WhatsApp"
            >
              💬
            </a>

            <button
              onClick={() =>
                setSelectedLead(lead)
              }
              className="rounded-lg p-2 hover:bg-slate-100"
              title="View"
            >
              👁️
            </button>

            <button
              onClick={() =>
                handleEdit(lead)
              }
              className="rounded-lg p-2 hover:bg-orange-100"
              title="Edit"
            >
              ✏️
            </button>

            <button
              onClick={() =>
                handleDelete(
                  lead.id!
                )
              }
              className="rounded-lg p-2 text-red-600 hover:bg-red-100"
              title="Delete"
            >
              🗑️
            </button>

          </div>

        </td>

      </tr>

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

            <div className="flex items-center gap-3">

              <span className="text-sm">
                Rows
              </span>

              <select
                value={pageSize}
                onChange={(e) =>
                  setPageSize(
                    Number(e.target.value)
                  )
                }
                className="rounded-lg border px-3 py-2"
              >

                <option value={10}>
                  10
                </option>

                <option value={25}>
                  25
                </option>

                <option value={50}>
                  50
                </option>

                <option value={100}>
                  100
                </option>

              </select>

              <span className="ml-6 text-sm">
                Sort
              </span>

              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(
                    e.target.value
                  )
                }
                className="rounded-lg border px-3 py-2"
              >

                <option value="latest">
                  Latest
                </option>

                <option value="customer">
                  Customer
                </option>

                <option value="followup">
                  Follow-up Date
                </option>

                <option value="value">
                  Expected Value
                </option>

              </select>

            </div>

            <div className="text-sm text-slate-500">

              Page

              <b className="mx-2">
                {currentPage}
              </b>

              of

              <b className="mx-2">
                {totalPages}
              </b>

            </div>

            <div className="flex gap-2">

              <button
                disabled={
                  currentPage === 1
                }
                onClick={() =>
                  setCurrentPage(
                    (page) =>
                      page - 1
                  )
                }
                className="rounded-lg border px-4 py-2 disabled:opacity-40"
              >
                Previous
              </button>

              <button
                disabled={
                  currentPage ===
                  totalPages
                }
                onClick={() =>
                  setCurrentPage(
                    (page) =>
                      page + 1
                  )
                }
                className="rounded-lg border px-4 py-2 disabled:opacity-40"
              >
                Next
              </button>

            </div>

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

interface SummaryCardProps {
  title: string;
  value: string | number;
  color:
    | "blue"
    | "red"
    | "green"
    | "yellow"
    | "orange"
    | "cyan";
}

function SummaryCard({
  title,
  value,
  color,
}: SummaryCardProps) {

  const colors = {
    blue:
      "bg-blue-50 border-blue-200 text-blue-700",
    red:
      "bg-red-50 border-red-200 text-red-700",
    green:
      "bg-green-50 border-green-200 text-green-700",
    yellow:
      "bg-yellow-50 border-yellow-200 text-yellow-700",
    orange:
      "bg-orange-50 border-orange-200 text-orange-700",
    cyan:
      "bg-cyan-50 border-cyan-200 text-cyan-700",
  };

  return (
    <div
      className={`rounded-xl border p-5 ${colors[color]}`}
    >
      <p className="text-sm opacity-70">
        {title}
      </p>

      <h2 className="mt-2 text-3xl font-bold">
        {value}
      </h2>
    </div>
  );
}