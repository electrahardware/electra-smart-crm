import type { ReactNode } from "react";

type Props = {
  title: string;
  children: ReactNode;
};

export default function SectionCard({
  title,
  children,
}: Props) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b bg-slate-50 px-5 py-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
          {title}
        </h3>
      </div>

      <div className="p-5">
        {children}
      </div>
    </div>
  );
}