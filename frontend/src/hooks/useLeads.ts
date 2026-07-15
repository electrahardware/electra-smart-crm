import { useCallback, useEffect, useState } from "react";

import { getLeads } from "../services/leadService";
import type { Lead } from "../types/lead";

export function useLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);

  const loadLeads = useCallback(async () => {
    try {
      setLoading(true);

      const data = await getLeads();

      setLeads(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLeads();

    const handler = () => {
      loadLeads();
    };

    window.addEventListener("lead-imported", handler);

    return () => {
      window.removeEventListener("lead-imported", handler);
    };
  }, [loadLeads]);

  return {
    leads,
    loading,
    loadLeads,
  };
}
