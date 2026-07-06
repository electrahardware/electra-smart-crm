import { useEffect, useState } from "react";
import { useLead } from "../../hooks/useLead";

import {
  getLeads,
  deleteLead,
} from "../../services/leadService";
import type { Lead } from "../../types/lead";
import LeadDetailsDrawer from "./LeadDetailsDrawer";

export default function LeadTable() {

  const [leads, setLeads] = useState<Lead[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
  useState("All");
  const [ownerFilter, setOwnerFilter] =
  useState("All");
  const [followupFilter, setFollowupFilter] =
  useState("All");
  const [currentPage, setCurrentPage] =
  useState(1);

const [pageSize, setPageSize] =
  useState(10);
  const [sortBy, setSortBy] =
  useState("latest");
  const [
  selectedIds,
  setSelectedIds,
] = useState<number[]>([]);
  const [selectedLead, setSelectedLead] =
  useState<Lead | null>(null);

  const {
    setLead,
    setEditingId,
  } = useLead();

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

    } catch (err) {

      console.error(err);

    }

  }

  const filteredLeads = leads.filter((lead) => {

  const text = search.toLowerCase();

  const matchesSearch =

    lead.customerName
      .toLowerCase()
      .includes(text)

    ||

    lead.mobile
      .includes(text)

    ||

    (lead.shopName || "")
      .toLowerCase()
      .includes(text);

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

  if (followupFilter === "Today") {
    return date === today;
  }

  if (followupFilter === "Overdue") {
    return date < today;
  }

  if (followupFilter === "Upcoming") {
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

useEffect(() => {

  setCurrentPage(1);

}, [
  search,
  statusFilter,
  ownerFilter,
  followupFilter,
  pageSize,
  sortBy,
]);

const sortedLeads = [...filteredLeads];

switch (sortBy) {

  case "customer":

    sortedLeads.sort((a, b) =>
      a.customerName.localeCompare(
        b.customerName
      )
    );

    break;

  case "followup":

    sortedLeads.sort((a, b) =>
      (a.followupDate || "").localeCompare(
        b.followupDate || ""
      )
    );

    break;

  case "value":

    sortedLeads.sort(
      (a, b) =>
        Number(b.expectedValue || 0) -
        Number(a.expectedValue || 0)
    );

    break;

  default:

    sortedLeads.sort(
      (a, b) =>
        (b.id || 0) -
        (a.id || 0)
    );

}

const totalPages = Math.max(
  1,
  Math.ceil(
    filteredLeads.length / pageSize
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
        lead.priority === "🔴 Hot"
    ).length;

  const today =
    new Date()
      .toISOString()
      .slice(0, 10);

  const todayFollowups =
    filteredLeads.filter(
      (lead) =>
        lead.followupDate &&
        lead.followupDate
          .slice(0, 10) === today
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
    const overdueLeads = filteredLeads.filter((lead) => {

  if (!lead.followupDate) return false;

  return lead.followupDate.slice(0, 10) < today;

}).length;

const upcomingLeads = filteredLeads.filter((lead) => {

  if (!lead.followupDate) return false;

  return lead.followupDate.slice(0, 10) > today;

}).length;
async function handleDeleteSelected() {

  if (selectedIds.length === 0) {

    alert("Please select leads.");

    return;

  }

  const ok = window.confirm(

    `Delete ${selectedIds.length} selected lead(s)?`

  );

  if (!ok) return;

  try {

    await Promise.all(

      selectedIds.map((id) =>

        deleteLead(id)

      )

    );

    setSelectedIds([]);

    await loadLeads();

    alert("Selected Leads Deleted");

  } catch (err) {

    console.error(err);

    alert("Unable to delete selected leads");

  }

}    

async function handleDelete(
    id: number
  ) {

    const ok = window.confirm(
      "Are you sure you want to delete this lead?"
    );

    if (!ok) return;

    try {

      await deleteLead(id);

      await loadLeads();

      alert(
        "Lead Deleted Successfully"
      );

    } catch (err) {

      console.error(err);

      alert(
        "Unable to delete lead"
      );

    }

  }

  function toggleLead(id: number) {

  if (selectedIds.includes(id)) {

    setSelectedIds(
      selectedIds.filter(
        (item) => item !== id
      )
    );

    return;

  }

  setSelectedIds([
    ...selectedIds,
    id,
  ]);

}

function toggleAll() {

  if (
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

  return (
     <>
    

    <div className="bg-white rounded-2xl shadow border border-slate-200">

      {selectedIds.length > 0 && (

<div className="flex items-center justify-between px-6 py-4 bg-red-50 border-b">

<div className="font-semibold text-red-700">

{selectedIds.length}

lead(s) selected

</div>

<button

onClick={handleDeleteSelected}

className="rounded-xl bg-red-600 hover:bg-red-700 text-white px-5 py-2 font-semibold"

>

🗑 Delete Selected

</button>

</div>

)}
      
      <div className="p-6 border-b">

        <h2 className="text-xl font-bold">

          Saved Leads

        </h2>

      </div>

      <div className="grid grid-cols-6 gap-4 p-6 border-b">

        <div className="bg-blue-50 rounded-xl p-5 border">

          <p className="text-sm text-slate-500">
            Total Leads
          </p>

          <h2 className="text-3xl font-bold text-blue-700">
            {totalLeads}
          </h2>

        </div>

        <div className="bg-red-50 rounded-xl p-5 border">

          <p className="text-sm text-slate-500">
            Hot Leads
          </p>

          <h2 className="text-3xl font-bold text-red-700">
            {hotLeads}
          </h2>

        </div>        <div className="bg-green-50 rounded-xl p-5 border">

          <p className="text-sm text-slate-500">
            Today's Follow-up
          </p>

          <h2 className="text-3xl font-bold text-green-700">
            {todayFollowups}
          </h2>

        </div>

        <div className="bg-yellow-50 rounded-xl p-5 border">

          <p className="text-sm text-slate-500">
            Expected Value
          </p>

          <h2 className="text-3xl font-bold text-yellow-700">
            ₹ {expectedValue.toLocaleString()}
          </h2>

        </div>

        <div className="bg-orange-50 rounded-xl p-5 border">

  <p className="text-sm text-slate-500">
    Overdue
  </p>

  <h2 className="text-3xl font-bold text-orange-700">
    {overdueLeads}
  </h2>

</div>

<div className="bg-cyan-50 rounded-xl p-5 border">

  <p className="text-sm text-slate-500">
    Upcoming
  </p>

  <h2 className="text-3xl font-bold text-cyan-700">
    {upcomingLeads}
  </h2>

</div>

      </div>

      <div className="p-6 border-b">

        <input
          type="text"
          placeholder="🔍 Search by Name, Mobile or Shop..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-red-600 focus:ring-2 focus:ring-red-200"
        />

        <select
  value={statusFilter}
  onChange={(e) =>
    setStatusFilter(
      e.target.value
    )
  }
  className="mt-4 w-full rounded-xl border border-slate-300 px-4 py-3"
>

  <option>
    All
  </option>

  <option>
    New
  </option>

  <option>
    Follow-up
  </option>

  <option>
    Quotation Sent
  </option>

  <option>
    Won
  </option>

  <option>
    Lost
  </option>

</select>

<select
  value={ownerFilter}
  onChange={(e) =>
    setOwnerFilter(
      e.target.value
    )
  }
  className="mt-4 w-full rounded-xl border border-slate-300 px-4 py-3"
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
  className="mt-4 w-full rounded-xl border border-slate-300 px-4 py-3"
>

  <option value="All">
    All Follow-ups
  </option>

  <option value="Today">
    Today
  </option>

  <option value="Overdue">
    Overdue
  </option>

  <option value="Upcoming">
    Upcoming
  </option>

</select>

      </div>

      <div className="overflow-auto max-h-[650px]">

<table className="w-full">

        <thead className="sticky top-0 z-10 bg-slate-100 shadow-sm">

          <tr>

            <th className="p-3">

<input
type="checkbox"

checked={
paginatedLeads.length>0 &&
selectedIds.length===
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

        <tbody>          {paginatedLeads.map((lead) => (

            <tr
              key={lead.id}
              className={`border-t

${
  lead.followupDate &&
  lead.followupDate.slice(0, 10) <
    new Date().toISOString().slice(0, 10)

    ? "bg-red-50"

    : lead.followupDate &&
      lead.followupDate.slice(0, 10) ===
        new Date().toISOString().slice(0, 10)

    ? "bg-green-50"

    : "hover:bg-slate-50"
}`}
            >

              <td className="p-3">

<input

type="checkbox"

checked={
selectedIds.includes(
lead.id!
)
}

onChange={()=>

toggleLead(
lead.id!
)

}

/>

</td>
              
              <td className="p-3">
                {lead.customerName}
              </td>

              <td className="p-3">
                {lead.mobile}
              </td>

              <td className="p-3">
                {lead.shopName || "-"}
              </td>

              <td className="p-3">

                <span
  className={`px-3 py-1 rounded-full text-xs font-semibold

${
lead.status==="New"
?"bg-blue-100 text-blue-700"

:lead.status==="Follow-up"
?"bg-yellow-100 text-yellow-700"

:lead.status==="Quotation Sent"
?"bg-purple-100 text-purple-700"

:lead.status==="Won"
?"bg-green-100 text-green-700"

:lead.status==="Lost"
?"bg-red-100 text-red-700"

:"bg-slate-100 text-slate-700"

}`}
>

{lead.status || "-"}

</span>

              </td>

              <td className="p-3">
                {lead.leadOwner || "-"}
              </td>

              <td className="p-3">

                <span
  className={`px-3 py-1 rounded-full text-xs font-semibold

${
lead.priority==="🔴 Hot"
?"bg-red-100 text-red-700"

:lead.priority==="🟠 Warm"
?"bg-orange-100 text-orange-700"

:lead.priority==="🔵 Cold"
?"bg-blue-100 text-blue-700"

:"bg-slate-100 text-slate-700"

}`}
>

{lead.priority || "-"}

</span>

              </td>

              <td className="p-3">

  <div className="flex items-center gap-3 flex-wrap">

    <a
      href={`tel:${lead.mobile}`}
      className="text-blue-600 hover:text-blue-800 font-semibold"
    >
      📞 Call
    </a>

    <a
      href={`https://wa.me/91${lead.mobile}`}
      target="_blank"
      rel="noreferrer"
      className="text-green-600 hover:text-green-800 font-semibold"
    >
      💬 WhatsApp
    </a>

    <button
      onClick={() => setSelectedLead(lead)}
      className="text-emerald-600 hover:text-emerald-800 font-semibold"
    >
      👁 View
    </button>

    <button
      onClick={() => handleEdit(lead)}
      className="text-blue-600 hover:text-blue-800 font-semibold"
    >
      ✏️ Edit
    </button>

    <button
      onClick={() => handleDelete(lead.id!)}
      className="text-red-600 hover:text-red-800 font-semibold"
    >
      🗑 Delete
    </button>

  </div>

</td>

            </tr>

          ))}        </tbody>

      </table>

      </div>

      {filteredLeads.length === 0 && (

        <div className="p-10 text-center text-slate-500">

          No leads found.

        </div>

      )}

      {filteredLeads.length > 0 && (

<div className="flex items-center justify-between p-5 border-t">

<div className="flex items-center gap-2">

<span className="text-sm">

Rows

<div className="flex items-center gap-2">

<span className="text-sm">

Sort

</span>

<select
value={sortBy}
onChange={(e)=>
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

</span>

<select

value={pageSize}

onChange={(e)=>

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

</div>

<div className="text-sm text-slate-500">

Page

<b className="mx-1">

{currentPage}

</b>

of

<b className="mx-1">

{totalPages}

</b>

</div>

<div className="flex gap-2">

<button
disabled={currentPage===1}
onClick={()=>
setCurrentPage(
(current)=>current-1
)
}
className="rounded-lg border px-4 py-2 disabled:opacity-40"
>

Previous

</button>

<button
disabled={
currentPage===totalPages
}
onClick={()=>
setCurrentPage(
(current)=>current+1
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
  onClose={() => setSelectedLead(null)}
/>

</>
);
}