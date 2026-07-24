import { useEffect, useState } from "react";

import type { Lead } from "../../types/lead";
import type { Timeline } from "../../types/timeline";

import { getTimeline } from "../../services/timelineService";

interface Props {
  lead: Lead | null;
}

export default function LeadTimeline({
  lead,
}: Props) {

  const [timeline, setTimeline] =
    useState<Timeline[]>([]);

    const [filter, setFilter] =
  useState("ALL");

  const [search, setSearch] =
  useState("");

  const [selectedDate, setSelectedDate] =
  useState("");

  useEffect(() => {

  if (!lead?.id) {
    return;
  }

  loadTimeline(lead.id);

  const handler = () => {

    if (lead.id) {
      loadTimeline(lead.id);
    }

  };

  window.addEventListener(
    "lead-updated",
    handler
  );

  return () => {

    window.removeEventListener(
      "lead-updated",
      handler
    );

  };

}, [lead?.id]);

  async function loadTimeline(
    leadId: number
  ) {

    try {

      const data =
        await getTimeline(leadId);

      setTimeline(data);

    } catch (error) {

      console.error(error);

    }

  }

  function getBadge(type: string) {

    switch (type) {

      case "NOTE":
        return {
          icon: "📝",
          color:
            "bg-blue-100 text-blue-700",
        };

      case "CALL":
        return {
          icon: "📞",
          color:
            "bg-green-100 text-green-700",
        };

      case "ATTACHMENT":
        return {
          icon: "📎",
          color:
            "bg-purple-100 text-purple-700",
        };

      case "FOLLOWUP":
        return {
          icon: "✅",
          color:
            "bg-emerald-100 text-emerald-700",
        };

      case "LEAD":
        return {
          icon: "👤",
          color:
            "bg-orange-100 text-orange-700",
        };

      default:
        return {
          icon: "📌",
          color:
            "bg-slate-100 text-slate-700",
        };

    }

  }

  function timeAgo(date: string) {

    const diff =
      Date.now() -
      new Date(date).getTime();

    const mins =
      Math.floor(diff / 60000);

    if (mins < 1) {
      return "Just now";
    }

    if (mins < 60) {
      return `${mins} min ago`;
    }

    const hrs =
      Math.floor(mins / 60);

    if (hrs < 24) {
      return `${hrs} hr ago`;
    }

    const days =
      Math.floor(hrs / 24);

    if (days === 1) {
      return "Yesterday";
    }

    if (days < 30) {
      return `${days} days ago`;
    }

    return new Date(
      date
    ).toLocaleDateString();

  }

  function exportCSV() {

  const rows = timeline.map((item) => ({
    Type: item.type,
    Title: item.title,
    Description:
      item.description || "",
    CreatedBy:
      item.createdBy || "",
    Date:
      new Date(
        item.createdAt
      ).toLocaleString(),
  }));

  const csv = [

    Object.keys(rows[0] || {}).join(","),

    ...rows.map((row) =>
      Object.values(row)
        .map((v) => `"${v}"`)
        .join(",")
    ),

  ].join("\n");

  const blob =
    new Blob([csv], {
      type: "text/csv",
    });

  const url =
    URL.createObjectURL(blob);

  const a =
    document.createElement("a");

  a.href = url;

  a.download =
    `${lead?.customerName}-timeline.csv`;

  a.click();

  URL.revokeObjectURL(url);

}

  if (!lead) {
    return null;
  }

  return (

    <div className="rounded-2xl border bg-white p-6">

      <h2 className="text-xl font-bold">
        🕒 Activity Timeline
      </h2>

      <div className="mt-4">

  <button
    onClick={exportCSV}
    className="rounded-xl bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700"
  >
    📤 Export CSV
  </button>

</div>

      <input
  type="text"
  placeholder="Search activity..."
  value={search}
  onChange={(e) =>
    setSearch(e.target.value)
  }
  className="mt-5 w-full rounded-xl border px-4 py-3 focus:border-blue-500 focus:outline-none"
/>

<input
  type="date"
  value={selectedDate}
  onChange={(e) =>
    setSelectedDate(
      e.target.value
    )
  }
  className="mt-3 w-full rounded-xl border px-4 py-3 focus:border-blue-500 focus:outline-none"
/>

<button
  onClick={() => {
    setFilter("ALL");
    setSearch("");
    setSelectedDate("");
  }}
  className="mt-3 rounded-xl bg-slate-800 px-4 py-3 text-white hover:bg-slate-900"
>
  Clear Filters
</button>

<div className="mt-5 flex items-center justify-between rounded-xl bg-slate-50 p-4">

  <div>

    <p className="text-sm text-slate-500">
      Total Activities
    </p>

    <p className="text-2xl font-bold">
      {timeline.length}
    </p>

  </div>

  <div className="text-sm text-slate-500">

    Showing{" "}
    {
      timeline.filter(
        (item) =>
          (filter === "ALL" ||
            item.type === filter) &&
          (
            item.title
              .toLowerCase()
              .includes(
                search.toLowerCase()
              ) ||
            (item.description || "")
              .toLowerCase()
              .includes(
                search.toLowerCase()
              )
          ) &&
          (
            !selectedDate ||
            item.createdAt.slice(0, 10) ===
              selectedDate
          )
      ).length
    }{" "}
    result(s)

  </div>

</div>

      <div className="mt-5 flex flex-wrap gap-2">

  {[
    "ALL",
    "NOTE",
    "CALL",
    "ATTACHMENT",
    "FOLLOWUP",
    "LEAD",
  ].map((item) => (

    <button
      key={item}
      onClick={() =>
        setFilter(item)
      }
      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
        filter === item
          ? "bg-blue-600 text-white"
          : "bg-slate-100 hover:bg-slate-200"
      }`}
    >
      {item}
    </button>

  ))}

</div>

      <p className="mt-1 text-sm text-slate-500">
        Complete history of this lead.
      </p>

      {timeline.length === 0 ? (

        <div className="py-16 text-center text-slate-400">

          No activities found.

        </div>

      ) : (

        <div className="mt-8 space-y-5">

          {timeline
  .filter((item) => {

    const matchesType =
      filter === "ALL" ||
      item.type === filter;

    const matchesSearch =
      item.title
        .toLowerCase()
        .includes(
          search.toLowerCase()
        ) ||

      (item.description || "")
        .toLowerCase()
        .includes(
          search.toLowerCase()
        );

    const matchesDate =
      !selectedDate ||
      item.createdAt
        .slice(0, 10) ===
        selectedDate;

    return (
      matchesType &&
      matchesSearch &&
      matchesDate
    );

  })
  .map((item) => {

            const badge =
              getBadge(item.type);

            return (

              <div
                key={item.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
              >

                <div className="flex items-start justify-between">

                  <div className="flex items-center gap-3">

                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-full text-lg ${badge.color}`}
                    >
                      {badge.icon}
                    </div>

                    <div>

                      <h3 className="font-semibold text-slate-800">
                        {item.title}
                      </h3>

                      <p className="mt-1 text-xs text-slate-500">
                        {timeAgo(
                          item.createdAt
                        )}
                      </p>

                    </div>

                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${badge.color}`}
                  >
                    {item.type}
                  </span>

                </div>

                <p className="mt-4 text-sm leading-6 text-slate-600">
                  {item.description || "-"}
                </p>

                <div className="mt-4 flex items-center justify-between border-t pt-3 text-xs text-slate-400">

                  <span>
                    👤 {item.createdBy || "System"}
                  </span>

                  <span>
                    {new Date(
                      item.createdAt
                    ).toLocaleString()}
                  </span>

                </div>

              </div>

            );

          })}

        </div>

      )}

    </div>

  );

}