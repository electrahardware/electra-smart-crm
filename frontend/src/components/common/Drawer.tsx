import type { ReactNode } from "react";

interface DrawerProps {
  open: boolean;
  title: string;
  onClose: () => void;
  width?: "sm" | "md" | "lg" | "xl";
  children: ReactNode;
}

export default function Drawer({
  open,
  title,
  onClose,
  width = "md",
  children,
}: DrawerProps) {
  if (!open) return null;

  const widthClass = {
    sm: "max-w-md",
    md: "max-w-2xl",
    lg: "max-w-4xl",
    xl: "max-w-6xl",
  }[width];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">

      {/* Overlay */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/45 backdrop-blur-sm"
      />

      {/* Modal */}
      <div
        className={`relative w-full ${widthClass} overflow-hidden rounded-3xl bg-white shadow-2xl`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">

          <h2 className="text-2xl font-bold">
            {title}
          </h2>

          <button
            onClick={onClose}
            className="rounded-xl p-2 transition hover:bg-slate-100"
          >
            ✕
          </button>

        </div>

        {/* Body */}
        <div className="max-h-[80vh] overflow-y-auto p-6">
          {children}
        </div>

      </div>

    </div>
  );
}