import { createContext, useContext, useState } from "react";

interface SidebarContextType {
  open: boolean;
  setOpen: (value: boolean) => void;
  toggle: () => void;
}

const SidebarContext =
  createContext<SidebarContextType | null>(null);

export function SidebarProvider({
  children,
}: {
  children: React.ReactNode;
}) {

  const [open, setOpen] =
    useState(false);

  function toggle() {
    setOpen((prev) => !prev);
  }

  return (
    <SidebarContext.Provider
      value={{
        open,
        setOpen,
        toggle,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );

}

export function useSidebar() {

  const context =
    useContext(SidebarContext);

  if (!context) {

    throw new Error(
      "useSidebar must be used inside SidebarProvider."
    );

  }

  return context;

}