import { useEffect, useState } from "react";

import {
  getActivities,
} from "../../services/activityService";

import type {
  Activity,
} from "../../types/activity";

export default function RecentActivities() {

  const [rows, setRows] =
    useState<Activity[]>([]);

  useEffect(() => {

    load();

  }, []);

  async function load() {

    try {

      const data =
        await getActivities();

      setRows(data);

    } catch (error) {

      console.error(error);

    }

  }

  return (

    <div className="rounded-2xl border bg-white p-6 shadow-sm">

      <h2 className="mb-5 text-xl font-bold">

        🕒 Recent Activity

      </h2>

      {rows.length === 0 ? (

        <div className="py-10 text-center text-slate-400">

          No activity found.

        </div>

      ) : (

        <div className="space-y-4">

          {rows.slice(0, 10).map((item) => (

            <div
              key={item.id}
              className="border-b pb-3 last:border-0"
            >

              <div className="flex items-center justify-between">

                <h3 className="font-semibold">

                  {item.title}

                </h3>

                <span className="text-xs text-slate-500">

                  {new Date(
                    item.createdAt
                  ).toLocaleString()}

                </span>

              </div>

              <p className="mt-1 text-sm text-slate-500">

                {item.description || "-"}

              </p>

              <p className="mt-2 text-xs text-slate-400">

                {item.createdBy || "System"}

              </p>

            </div>

          ))}

        </div>

      )}

    </div>

  );

}