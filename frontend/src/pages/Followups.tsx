import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";
import FollowupCard from "../components/leads/FollowupCard";

import {
  getFollowups,
}
from "../services/followupService";

import type { Lead } from "../types/lead";

export default function Followups() {
  const [searchParams] = useSearchParams();

  const defaultFilter =
    searchParams.get("filter") === "overdue"
      ? "overdue"
      : "today";

  const [loading, setLoading] = useState(true);

  const [filter, setFilter] = useState<
    "today" | "overdue"
  >(defaultFilter);

  const [search, setSearch] = useState("");

  const [rows, setRows] =
    useState<Lead[]>([]);

  useEffect(() => {

  loadFollowups();

}, [filter]);

  async function loadFollowups() {
    try {
      setLoading(true);

      const data =
  await getFollowups(filter);

      setRows(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const filtered = useMemo(() => {
    const keyword =
      search.toLowerCase();

    return rows.filter((lead) => {
      return (
        lead.customerName
          .toLowerCase()
          .includes(keyword) ||
        lead.mobile.includes(keyword) ||
        (lead.shopName ?? "")
          .toLowerCase()
          .includes(keyword)
      );
    });
  }, [rows, search]);

  return (
    <MainLayout>
      <div className="mb-8 flex items-center justify-between">

        <div>
          <h1 className="text-3xl font-bold">
            Follow-ups
          </h1>

          <p className="mt-2 text-slate-500">
            Manage all customer follow-ups
          </p>
        </div>

      </div>

      {/* Summary */}

      <div className="mb-6 grid gap-4 md:grid-cols-2">

        <div className="rounded-2xl border bg-white p-5 shadow-sm">

          <p className="text-sm text-slate-500">
            Today's Follow-ups
          </p>

          <h2 className="mt-2 text-4xl font-bold text-orange-600">
            {rows.length}
          </h2>

        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">

          <p className="text-sm text-slate-500">
            Overdue
          </p>

          <h2 className="mt-2 text-4xl font-bold text-red-600">
            0
          </h2>

        </div>

      </div>

      {/* Search */}

      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

        <input
          type="text"
          placeholder="Search customer, shop or mobile..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          className="w-full rounded-xl border px-4 py-3 outline-none focus:border-blue-500 md:max-w-md"
        />

        <div className="flex gap-3">

          <button
            onClick={() =>
              setFilter("today")
            }
            className={`rounded-xl px-5 py-2 font-medium ${
              filter === "today"
                ? "bg-blue-600 text-white"
                : "border bg-white"
            }`}
          >
            Today
          </button>

          <button
            onClick={() =>
              setFilter("overdue")
            }
            className={`rounded-xl px-5 py-2 font-medium ${
              filter === "overdue"
                ? "bg-red-600 text-white"
                : "border bg-white"
            }`}
          >
            Overdue
          </button>

        </div>

      </div>

      {loading ? (

        <div className="rounded-2xl border bg-white p-12 text-center text-slate-500">

          Loading Follow-ups...

        </div>

      ) : (

        <div>

          <div className="space-y-4">

  {filtered.length === 0 ? (

    <div className="rounded-2xl border bg-white p-12 text-center">

      <div className="text-6xl">
        📭
      </div>

      <h2 className="mt-4 text-2xl font-bold">

        No Follow-ups Found

      </h2>

      <p className="mt-2 text-slate-500">

        There are no follow-ups matching your search.

      </p>

    </div>

  ) : (

    filtered.map((lead) => (

      <FollowupCard
        key={lead.id}
        lead={lead}
        onUpdated={loadFollowups}
      />

    ))

  )}

</div>

        </div>

      )}

    </MainLayout>
  );
}

