import type { ReactNode } from "react";

import Sidebar from "../components/layout/Sidebar";
import NotificationBell from "../components/layout/NotificationBell";
import ProfileMenu from "../components/layout/ProfileMenu";

import {
  SidebarProvider,
} from "../hooks/useSidebar";

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({
  children,
}: MainLayoutProps) {

  return (

    <SidebarProvider>

      <div className="flex min-h-screen bg-slate-100">

        <Sidebar />

        <div className="flex min-w-0 flex-1 flex-col">

          <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6 shadow-sm lg:px-8">

            <div className="ml-14 lg:ml-0">

              <h1 className="text-2xl font-bold text-slate-800">

                Electra Smart CRM

              </h1>

              <p className="text-sm text-slate-500">

                Lead Management System

              </p>

            </div>

            <div className="flex items-center gap-4">

              <NotificationBell />

              <ProfileMenu />

            </div>

          </header>

          <main className="flex-1 overflow-auto p-4 lg:p-8">

            {children}

          </main>

        </div>

      </div>

    </SidebarProvider>

  );

}