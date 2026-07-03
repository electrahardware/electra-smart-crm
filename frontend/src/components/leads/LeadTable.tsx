import { useEffect, useState } from "react";
import { useLead } from "../../hooks/useLead";
import {
  getLeads,
  deleteLead,
} from "../../services/leadService";
import type { Lead } from "../../types/lead";

export default function LeadTable() {

  const [leads, setLeads] = useState<Lead[]>([]);
  const [search, setSearch] = useState("");
  const [selectedLead, setSelectedLead] =
  useState<Lead | null>(null);

  const {
    setLead,
    setEditingId,
  } = useLead();

  useEffect(() => {

    loadLeads();

    const interval = setInterval(loadLeads, 1000);

    return () => clearInterval(interval);

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

    return (

      lead.customerName
        .toLowerCase()
        .includes(text)

      ||

      lead.mobile.includes(text)

      ||

      (lead.shopName || "")
        .toLowerCase()
        .includes(text)

    );

  });

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

    <div className="bg-white rounded-2xl shadow border border-slate-200">

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

      </div>

      <table className="w-full">

        <thead className="bg-slate-100">

          <tr>

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

        <tbody>          {filteredLeads.map((lead) => (

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

                <button
                  onClick={() => handleEdit(lead)}
                  className="text-blue-600 hover:text-blue-800 font-semibold mr-4"
                >
                  <button
  onClick={() => setSelectedLead(lead)}
  className="text-green-600 hover:text-green-800 font-semibold mr-4"
>
  👁 View
</button>
                  
                  ✏️ Edit
                </button>

                <button
                  onClick={() => handleDelete(lead.id!)}
                  className="text-red-600 hover:text-red-800 font-semibold"
                >
                  🗑 Delete
                </button>

              </td>

            </tr>

          ))}        </tbody>

      </table>

      {filteredLeads.length === 0 && (

        <div className="p-10 text-center text-slate-500">

          No leads found.

        </div>

      )}

    {selectedLead && (

  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

    <div className="bg-white rounded-2xl shadow-2xl w-[700px] max-h-[90vh] overflow-y-auto p-8">

      <div className="flex items-center justify-between mb-6">

        <h2 className="text-2xl font-bold">
          👁 Lead Details
        </h2>

        <button
          onClick={() => setSelectedLead(null)}
          className="text-red-600 font-bold text-xl"
        >
          ✕
        </button>

      </div>

      <div className="flex gap-3 mb-6">

  <a
    href={`https://wa.me/91${selectedLead.mobile}`}
    target="_blank"
    rel="noreferrer"
    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl font-semibold"
  >
    💬 WhatsApp
  </a>

  <a
  href={`mailto:${selectedLead.email}`}
  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-semibold"
>
  📧 Email
</a>

<a
  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${selectedLead.addressLine1} ${selectedLead.addressLine2} ${selectedLead.area} ${selectedLead.district} ${selectedLead.state} ${selectedLead.pincode}`
  )}`}
  target="_blank"
  rel="noreferrer"
  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl font-semibold"
>
  📍 Google Map
</a>

</div>

      <div className="grid grid-cols-2 gap-5">

        <div>
          <p className="text-slate-500 text-sm">
            Customer Name
          </p>

          <p className="font-semibold">
            {selectedLead.customerName}
          </p>
        </div>

        <div>
          <p className="text-slate-500 text-sm">
            Mobile
          </p>

          <p className="font-semibold">
            {selectedLead.mobile}
          </p>
        </div>

        <div>
          <p className="text-slate-500 text-sm">
            WhatsApp
          </p>

          <p className="font-semibold">
            {selectedLead.whatsapp || "-"}
          </p>
        </div>

        <div>
          <p className="text-slate-500 text-sm">
            Shop
          </p>

          <p className="font-semibold">
            {selectedLead.shopName || "-"}
          </p>
        </div>

        <div>
          <p className="text-slate-500 text-sm">
            Lead Owner
          </p>

          <p className="font-semibold">
            {selectedLead.leadOwner || "-"}
          </p>
        </div>

        <div>
          <p className="text-slate-500 text-sm">
            Status
          </p>

          <p className="font-semibold">
            {selectedLead.status || "-"}
          </p>
        </div>

        <div className="col-span-2">

          <p className="text-slate-500 text-sm">
            Products
          </p>

          <p className="font-semibold">
            {Array.isArray(selectedLead.products)
              ? selectedLead.products.join(", ")
              : selectedLead.products || "-"}
          </p>

        </div>

        <div>
          <p className="text-slate-500 text-sm">
            Expected Value
          </p>

          <p className="font-semibold">
            ₹ {Number(selectedLead.expectedValue || 0).toLocaleString()}
          </p>
        </div>

        <div>
          <p className="text-slate-500 text-sm">
            Follow-up Date
          </p>

          <p className="font-semibold">
            {selectedLead.followupDate || "-"}
          </p>
        </div>

        <div className="col-span-2">

          <p className="text-slate-500 text-sm">
            Notes
          </p>

          <p className="font-semibold whitespace-pre-wrap">
            {selectedLead.notes || "-"}
          </p>

        </div>

      </div>

    </div>

  </div>

)}
    
    </div>

  );

}