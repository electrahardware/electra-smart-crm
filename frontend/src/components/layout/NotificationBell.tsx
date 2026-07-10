import { Bell } from "lucide-react";
import { useEffect, useState } from "react";

interface Notification {
  id: number;
  title: string;
  color: string;
}

export default function NotificationBell() {

  const [open, setOpen] =
    useState(false);

  const [items, setItems] =
    useState<Notification[]>([]);

  useEffect(() => {

    setItems([

      {
        id: 1,
        title:
          "12 Overdue Follow-ups",
        color:
          "text-red-600",
      },

      {
        id: 2,
        title:
          "5 Today's Follow-ups",
        color:
          "text-orange-600",
      },

      {
        id: 3,
        title:
          "8 New Leads Today",
        color:
          "text-green-600",
      },

    ]);

  }, []);

  return (

    <div className="relative">

      <button
        onClick={() =>
          setOpen(!open)
        }
        className="relative rounded-xl p-2 hover:bg-slate-100"
      >

        <Bell size={22} />

        {items.length > 0 && (

          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white">

            {items.length}

          </span>

        )}

      </button>

      {open && (

        <div className="absolute right-0 mt-3 w-80 rounded-2xl border bg-white p-4 shadow-2xl">

          <h2 className="mb-4 text-lg font-bold">

            Notifications

          </h2>

          <div className="space-y-3">

            {items.map((item) => (

              <div
                key={item.id}
                className="rounded-xl bg-slate-50 p-3"
              >

                <p
                  className={`font-medium ${item.color}`}
                >

                  {item.title}

                </p>

              </div>

            ))}

          </div>

        </div>

      )}

    </div>

  );

}