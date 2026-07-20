import {
  createContext,
  useContext,
  useState,
} from "react";

import type { ReactNode } from "react";
import type { Lead } from "../types/lead";
import { EmptyLead } from "../types/lead";

type LeadContextType = {
  lead: Lead;
  setLead: React.Dispatch<React.SetStateAction<Lead>>;

  editingId: number | null;
  setEditingId: React.Dispatch<
    React.SetStateAction<number | null>
  >;

    wizardOpen: boolean;

  setWizardOpen: React.Dispatch<
    React.SetStateAction<boolean>
  >;
};

const LeadContext =
  createContext<LeadContextType | null>(null);

export function LeadProvider({
  children,
}: {
  children: ReactNode;
}) {

  const [lead, setLead] =
    useState<Lead>(EmptyLead);

  const [editingId, setEditingId] =
    useState<number | null>(null);

  const [wizardOpen, setWizardOpen] =
  useState(false);

  return (
    <LeadContext.Provider
      value={{
        lead,
        setLead,

        editingId,
        setEditingId,

        wizardOpen,
setWizardOpen,
      }}
    >
      {children}
    </LeadContext.Provider>
  );
}

export function useLead() {

  const context = useContext(LeadContext);

  if (!context) {

    throw new Error(
      "useLead must be used inside LeadProvider"
    );

  }

  return context;

}