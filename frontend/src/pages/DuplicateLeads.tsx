import { useEffect, useState } from "react";

import MainLayout from "../layouts/MainLayout";

import type {
  DuplicateLead,
} from "../types/duplicate";

import {
  getDuplicates,
} from "../services/duplicateService";

export default function DuplicateLeads() {

  const [rows, setRows] =
    useState<DuplicateLead[]>([]);

  useEffect(() => {

    loadDuplicates();

  }, []);

  async function loadDuplicates() {

    try {

      const data =
        await getDuplicates();

      setRows(data);

    } catch (error) {

      console.error(error);

    }

  }

  return (

    <MainLayout>

      <div className="flex items-center justify-between">

        <div>

          <h1 className="text-3xl font-bold">

            🔀 Duplicate Leads

          </h1>

          <p className="mt-2 text-slate-500">

            Review duplicate customers.

          </p>

        </div>

        <div className="rounded-xl bg-red-100 px-5 py-3 text-lg font-bold text-red-700">

          {rows.length} Duplicate(s)

        </div>

      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border bg-white shadow-sm">

        <table className="w-full">

          <thead className="bg-slate-100">

            <tr>

              <th className="p-4 text-left">
                Customer
              </th>

              <th className="p-4 text-left">
                Mobile
              </th>

              <th className="p-4 text-left">
                Shop
              </th>

              <th className="p-4 text-left">
                Owner
              </th>

              <th className="p-4 text-left">
                State
              </th>

              <th className="p-4 text-center">
                Action
              </th>

            </tr>

          </thead>

          <tbody>

            {rows.map((lead) => (

              <tr
                key={lead.id}
                className="border-t hover:bg-slate-50"
              >

                <td className="p-4">
                  {lead.customerName}
                </td>

                <td className="p-4">
                  {lead.mobile}
                </td>

                <td className="p-4">
                  {lead.shopName || "-"}
                </td>

                <td className="p-4">
                  {lead.leadOwner || "-"}
                </td>

                <td className="p-4">
                  {lead.state || "-"}
                </td>

                <td className="p-4 text-center">

                  <button
                    className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                  >
                    Merge
                  </button>

                </td>

              </tr>

            ))}

            {rows.length === 0 && (

              <tr>

                <td
                  colSpan={6}
                  className="p-12 text-center text-slate-400"
                >

                  🎉 No duplicate leads found.

                </td>

              </tr>

            )}

          </tbody>

        </table>

      </div>

    </MainLayout>

  );

}