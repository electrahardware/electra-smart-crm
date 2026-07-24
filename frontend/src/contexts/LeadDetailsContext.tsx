import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type LeadDetails = any;

type LeadDetailsContextType = {
  lead: LeadDetails | null;
  setLead: (lead: LeadDetails | null) => void;

  loading: boolean;
  setLoading: (loading: boolean) => void;

  refreshKey: number;
  refreshLead: () => void;
};

const LeadDetailsContext = createContext<
  LeadDetailsContextType | undefined
>(undefined);

export function LeadDetailsProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [lead, setLead] =
    useState<LeadDetails | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [refreshKey, setRefreshKey] =
    useState(0);

  function refreshLead() {
    setRefreshKey((v) => v + 1);
  }

  const value = useMemo(
    () => ({
      lead,
      setLead,
      loading,
      setLoading,
      refreshKey,
      refreshLead,
    }),
    [lead, loading, refreshKey]
  );

  return (
    <LeadDetailsContext.Provider value={value}>
      {children}
    </LeadDetailsContext.Provider>
  );
}

export function useLeadDetails() {
  const context = useContext(LeadDetailsContext);

  if (!context) {
    throw new Error(
      "useLeadDetails must be used inside LeadDetailsProvider"
    );
  }

  return context;
}