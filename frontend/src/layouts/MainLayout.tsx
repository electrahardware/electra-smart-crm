import type { ReactNode } from "react";
import Sidebar from "../components/layout/Sidebar";

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar />

      <div className="flex-1">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8">
          <div>
            <h1 className="text-xl font-bold text-slate-800">
              Electra Smart CRM
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center font-bold">
              N
            </div>

            <div>
              <p className="font-semibold text-slate-800">
                Nirav Patel
              </p>

              <p className="text-xs text-slate-500">
                Owner
              </p>
            </div>
          </div>
        </header>

        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}