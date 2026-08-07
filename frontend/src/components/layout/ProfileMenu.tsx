import { LogOut, Settings, User } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { isOwnerOrManager } from "../../utils/auth";

export default function ProfileMenu() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const user = JSON.parse(sessionStorage.getItem("user") || "{}");

  function logout() {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");

    window.location.href = "/login";
  }

  function openSettings() {
    setOpen(false);

    if (!isOwnerOrManager()) {
      toast.error("You are not authorized to access Settings.");
      return;
    }

    navigate("/settings");
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-3 rounded-xl px-3 py-2 text-zinc-100 transition hover:bg-white/8"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-600 font-bold text-white">
          {(user.name || "U").charAt(0).toUpperCase()}
        </div>

        <div className="text-left">
          <p className="font-semibold">{user.name || "User"}</p>

          <p className="text-xs text-zinc-400">{user.role || "-"}</p>
        </div>
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-60 rounded-2xl border border-white/10 bg-[#181b21] p-2 text-zinc-100 shadow-2xl shadow-black/40">
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              navigate("/profile");
            }}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-zinc-200 transition hover:bg-white/8 hover:text-white"
          >
            <User size={18} />
            My Profile
          </button>

          <button
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-zinc-200 transition hover:bg-white/8 hover:text-white"
            onClick={openSettings}
          >
            <Settings size={18} />
            Settings
          </button>

          <hr className="my-2 border-white/10" />

          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-red-300 transition hover:bg-red-500/10 hover:text-red-200"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
