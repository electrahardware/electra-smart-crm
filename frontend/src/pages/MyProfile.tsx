import {
  ArrowUpRight,
  Building2,
  Globe2,
  Mail,
  MapPin,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";
import type { ReactNode } from "react";

import MainLayout from "../layouts/MainLayout";
import { getCurrentUser } from "../utils/auth";

const collections = [
  "Zinc Cabinet Handles",
  "Zinc Mortise Handles",
  "Aluminium Door Handles",
  "Aluminium Cabinet Handles",
  "Kadi & Knobs",
  "S.S. Hinges",
];

export default function MyProfile() {
  const user = getCurrentUser();
  const displayName = user?.name || "CRM User";
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <MainLayout>
      <div className="mx-auto max-w-6xl">
        <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#1b1d23] via-[#14161b] to-[#101114] p-6 shadow-2xl shadow-black/20 sm:p-8">
          <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-red-600/15 blur-3xl" />
          <div className="absolute -bottom-28 left-1/3 h-52 w-52 rounded-full bg-red-500/10 blur-3xl" />

          <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4 sm:gap-5">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-red-600 text-xl font-bold text-white shadow-lg shadow-red-950/40">
                {initials || "U"}
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-300">
                  My Profile
                </p>
                <h1 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  {displayName}
                </h1>
                <p className="mt-1 text-sm text-zinc-400">
                  {user?.role || "CRM User"} · Electra Smart CRM
                </p>
              </div>
            </div>

            <a
              href="https://www.electrahardware.com/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-400/25 bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-100 transition hover:border-red-400/50 hover:bg-red-500/20"
            >
              Visit Electra Hardware
              <ArrowUpRight size={16} />
            </a>
          </div>
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-[.9fr_1.3fr]">
          <section className="premium-surface p-6">
            <div className="flex items-center gap-3">
              <span className="rounded-xl bg-red-500/10 p-2 text-red-300">
                <UserRound size={20} />
              </span>
              <div>
                <h2 className="text-lg font-semibold text-white">Account details</h2>
                <p className="mt-0.5 text-sm text-zinc-400">Your active CRM session</p>
              </div>
            </div>

            <dl className="mt-6 space-y-4">
              <ProfileDetail label="Full name" value={displayName} />
              <ProfileDetail label="Email" value={user?.email || "Not available"} icon={<Mail size={16} />} />
              <ProfileDetail label="Access role" value={user?.role || "CRM User"} icon={<ShieldCheck size={16} />} />
            </dl>
          </section>

          <section className="premium-surface p-6">
            <div className="flex items-center gap-3">
              <span className="rounded-xl bg-red-500/10 p-2 text-red-300">
                <Building2 size={20} />
              </span>
              <div>
                <h2 className="text-lg font-semibold text-white">Electra Hardware</h2>
                <p className="mt-0.5 text-sm text-zinc-400">Brand profile</p>
              </div>
            </div>

            <p className="mt-6 max-w-3xl leading-7 text-zinc-300">
              Electra Hardware is the flagship brand of D N Enterprise in Rajkot, offering premium architectural hardware built around innovation, craftsmanship and reliability.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <InfoCard icon={<MapPin size={18} />} title="Head office" value="Rajkot, Gujarat, India" />
              <InfoCard icon={<Globe2 size={18} />} title="Experience" value="12 years in the market" />
            </div>
          </section>
        </div>

        <section className="premium-surface mt-6 p-6">
          <div className="flex items-center gap-3">
            <span className="rounded-xl bg-red-500/10 p-2 text-red-300">
              <Sparkles size={20} />
            </span>
            <div>
              <h2 className="text-lg font-semibold text-white">Featured collections</h2>
              <p className="mt-0.5 text-sm text-zinc-400">Explore the Electra Hardware range</p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            {collections.map((collection) => (
              <span
                key={collection}
                className="rounded-xl border border-white/10 bg-white/[0.035] px-3.5 py-2 text-sm font-medium text-zinc-200"
              >
                {collection}
              </span>
            ))}
          </div>
        </section>
      </div>
    </MainLayout>
  );
}

function ProfileDetail({ label, value, icon }: { label: string; value: string; icon?: ReactNode }) {
  return (
    <div className="rounded-xl border border-white/8 bg-white/[0.025] px-4 py-3">
      <dt className="flex items-center gap-2 text-xs font-medium text-zinc-500">
        {icon && <span className="text-red-300">{icon}</span>}
        {label}
      </dt>
      <dd className="mt-1.5 break-words text-sm font-semibold text-zinc-100">{value}</dd>
    </div>
  );
}

function InfoCard({ icon, title, value }: { icon: ReactNode; title: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/8 bg-white/[0.025] p-4">
      <div className="flex items-center gap-2 text-red-300">{icon}<span className="text-sm font-medium text-zinc-400">{title}</span></div>
      <p className="mt-2 text-sm font-semibold text-zinc-100">{value}</p>
    </div>
  );
}
