import { useEffect, useState } from "react";
import { getAnalytics, type AnalyticsResponse } from "../services/analyticsService";
import MainLayout from "../layouts/MainLayout";

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await getAnalytics();
        setData(res);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) {
    return (
      <div className="p-6 text-slate-500">
        Loading analytics...
      </div>
    );
  }

  return (
  <MainLayout>

    <div className="mb-8">

      <h1 className="text-3xl font-bold text-slate-800">
        Analytics
      </h1>

      <p className="mt-2 text-slate-500">
        Business insights and performance
      </p>

    </div>

    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">

      <Card
        title="Total Leads"
        value={data?.totalLeads ?? 0}
      />

      <Card
        title="Today's Leads"
        value={data?.newToday ?? 0}
      />

      <Card
        title="Hot Leads"
        value={data?.hotLeads ?? 0}
      />

      <Card
        title="Warm Leads"
        value={data?.warmLeads ?? 0}
      />

      <Card
        title="Cold Leads"
        value={data?.coldLeads ?? 0}
      />

      <Card
        title="No Requirement"
value={data?.noReqLeads ?? 0}
      />

      <Card
        title="Overdue Follow-ups"
        value={data?.overdue ?? 0}
      />

    </div>

    <div className="mt-8 grid gap-6 lg:grid-cols-2">

  {/* Top Cities */}

  <div className="rounded-2xl border bg-white p-6 shadow-sm">

    <h2 className="mb-6 text-xl font-bold">
      🏙 Top Cities
    </h2>

    <div className="space-y-4">

      {data?.cityWise?.length ? (

        data.cityWise.map((item) => {

          const max =
            data.cityWise[0]._count.city;

          const width =
            (item._count.city / max) * 100;

          return (

            <div key={item.city ?? "Unknown"}>

              <div className="mb-1 flex justify-between">

                <span>{item.city || "Not Available"}</span>

                <span className="font-semibold">
                  {item._count.city}
                </span>

              </div>

              <div className="h-3 rounded-full bg-slate-200">

                <div
                  className="h-3 rounded-full bg-blue-600"
                  style={{
                    width: `${width}%`,
                  }}
                />

              </div>

            </div>

          );

        })

      ) : (

        <p className="text-slate-500">
          No city data available.
        </p>

      )}

    </div>

  </div>

  {/* Lead Sources */}

  <div className="rounded-2xl border bg-white p-6 shadow-sm">

    <h2 className="mb-6 text-xl font-bold">
      📌 Lead Sources
    </h2>

    <div className="space-y-3">

      {data?.sourceWise?.length ? (

        data.sourceWise.map((item) => (

          <div
            key={item.leadSource ?? "Unknown"}
            className="flex justify-between border-b pb-2"
          >

            <span>{item.leadSource || "Not Assigned"}</span>

            <span className="font-semibold">
              {item._count.leadSource}
            </span>

          </div>

        ))

      ) : (

        <p className="text-slate-500">
          No lead source data.
        </p>

      )}

    </div>

  </div>

</div>

<div className="mt-6 grid gap-6 lg:grid-cols-2">

  {/* Lead Status */}

  <div className="rounded-2xl border bg-white p-6 shadow-sm">

    <h2 className="mb-6 text-xl font-bold">
      📊 Lead Status
    </h2>

    <div className="space-y-3">

      {data?.statusWise?.length ? (

        data.statusWise.map((item) => (

          <div
            key={item.status ?? "Unknown"}
            className="flex justify-between border-b pb-2"
          >

            <span>{item.status || "Not Assigned"}</span>

            <span className="font-semibold">
              {item._count.status}
            </span>

          </div>

        ))

      ) : (

        <p className="text-slate-500">
          No status data.
        </p>

      )}

    </div>

  </div>

  {/* Priority */}

  <div className="rounded-2xl border bg-white p-6 shadow-sm">

    <h2 className="mb-6 text-xl font-bold">
      ⭐ Priority
    </h2>

    <div className="space-y-3">

      {data?.priorityWise?.length ? (

        data.priorityWise.map((item) => (

          <div
            key={item.priority ?? "Unknown"}
            className="flex justify-between border-b pb-2"
          >

            <span>{item.priority ?? "Unknown"}</span>

            <span className="font-semibold">
              {item._count.priority}
            </span>

          </div>

        ))

      ) : (

        <p className="text-slate-500">
          No priority data.
        </p>

      )}

    </div>

  </div>

</div>

  </MainLayout>
);
}

function Card({
  title,
  value,
}: {
  title: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">

      <p className="text-sm text-slate-500">
        {title}
      </p>

      <h2 className="mt-3 text-4xl font-bold text-blue-600">
        {value}
      </h2>

      <p className="mt-4 text-xs font-medium text-blue-600">
        Live Data
      </p>

    </div>
  );
}