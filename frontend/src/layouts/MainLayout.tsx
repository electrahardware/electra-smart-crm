import type { ReactNode } from "react";

import Sidebar from "../components/layout/Sidebar";
import Header from "../components/layout/Header";
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

          <Header />

          <main className="flex-1 overflow-auto p-4 lg:p-8">

            {children}

          </main>

        </div>

      </div>

    </SidebarProvider>

  );

}