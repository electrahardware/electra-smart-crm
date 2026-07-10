import { useEffect, useState } from "react";

import type { Followup } from "../../types/followup";
import { getTodayFollowups } from "../../services/followupService";

export default function TodayFollowups() {

  const [followups, setFollowups] =
    useState<Followup[]>([]);

  useEffect(() => {

    loadFollowups();

  }, []);

  async function loadFollowups() {

    try {

      const data =
        await getTodayFollowups();

      setFollowups(data);

    } catch (error) {

      console.error(error);

    }

  }

  return (

    <div className="rounded-2xl border bg-white p-6 shadow-sm">

      <h2 className="text-xl font-bold">

        📅 Today's Follow-ups

      </h2>

      {followups.length === 0 ? (

        <div className="py-10 text-center text-slate-400">

          No Follow-ups Today

        </div>

      ) : (

        <div className="mt-5 space-y-3">

          {followups.map((item) => (

            <div
              key={item.id}
              className="rounded-xl border p-4"
            >

              <div className="flex items-center justify-between">

                <div>

                  <p className="font-semibold">

                    {item.customerName}

                  </p>

                  <p className="text-sm text-slate-500">

                    {item.shopName || "-"}

                  </p>

                </div>

                <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-600">

                  {item.followupTime || "Today"}

                </span>

              </div>

            </div>

          ))}

        </div>

      )}

    </div>

  );

}