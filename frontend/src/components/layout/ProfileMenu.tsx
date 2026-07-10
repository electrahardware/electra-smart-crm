import { LogOut, Settings, User } from "lucide-react";
import { useState } from "react";

export default function ProfileMenu() {

  const [open, setOpen] =
    useState(false);

  const user = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  function logout() {

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href = "/login";

  }

  return (

    <div className="relative">

      <button
        onClick={() =>
          setOpen(!open)
        }
        className="flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-slate-100"
      >

        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-600 font-bold text-white">

          {(user.name || "U")
            .charAt(0)
            .toUpperCase()}

        </div>

        <div className="text-left">

          <p className="font-semibold">

            {user.name || "User"}

          </p>

          <p className="text-xs text-slate-500">

            {user.role || "-"}

          </p>

        </div>

      </button>

      {open && (

        <div className="absolute right-0 mt-3 w-60 rounded-2xl border bg-white p-2 shadow-2xl">

          <button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 hover:bg-slate-100">

            <User size={18} />

            My Profile

          </button>

          <button
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 hover:bg-slate-100"
            onClick={() =>
              window.location.href =
                "/settings"
            }
          >

            <Settings size={18} />

            Settings

          </button>

          <hr className="my-2" />

          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-red-600 hover:bg-red-50"
          >

            <LogOut size={18} />

            Logout

          </button>

        </div>

      )}

    </div>

  );

}