import { Bell } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getNotifications } from "../../services/notificationService";

interface Notification {
  id: number;
  title: string;
  color: string;
  path: string;
}

export default function NotificationBell() {

  const navigate = useNavigate();

  const [open, setOpen] =
    useState(false);

  const [items, setItems] =
    useState<Notification[]>([]);
    

  useEffect(() => {

  async function loadNotifications() {

    try {

      const data =
        await getNotifications();

      setItems([

        {

          id: 1,

          title: `${data.overdue} Overdue Follow-ups`,

          color: "text-red-600",

          path: "/followups?filter=overdue",

        },

        {

          id: 2,

          title: `${data.today} Today's Follow-ups`,

          color: "text-orange-600",

          path: "/followups",

        },

        {

          id: 3,

          title: `${data.newLeads} New Leads Today`,

          color: "text-green-600",

          path: "/leads",

        },

      ]);

    } catch (error) {

      console.error(error);

    }

  }

  loadNotifications();

}, []);

  const unreadCount = items.reduce((sum, item) => {
    const count = parseInt(item.title, 10);
    return sum + (Number.isNaN(count) ? 0 : count);
  }, 0);

  return (

    <div className="relative">

      <button
        onClick={() =>
          setOpen(!open)
        }
        className="relative rounded-xl p-2 hover:bg-slate-100"
      >

        <Bell size={22} />

        {unreadCount > 0 && (

          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white">

            {unreadCount}

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
    onClick={() => {

      navigate(item.path);

      setOpen(false);

    }}
    className="cursor-pointer rounded-xl bg-slate-50 p-3 transition hover:bg-blue-50"
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
