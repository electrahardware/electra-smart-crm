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
    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 mb-8">

      <h3 className="text-xl font-bold text-slate-800 mb-6">
        {title}
      </h3>

      {children}

    </div>
  );
}