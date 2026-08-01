import { api } from "../lib/api";

export interface AuditLog {
  id: number;

  module: string;
  action: string;

  userId?: number;
  userName: string;

  entityId?: number;
  entityName?: string;

  oldValues?: unknown;
  newValues?: unknown;

  ipAddress?: string;

  createdAt: string;
}

export interface AuditResponse {
  data: AuditLog[];

  total: number;

  page: number;

  limit: number;
}

export interface AuditFilters {
  page?: number;

  search?: string;

  module?: string;

  action?: string;

  user?: string;

  fromDate?: string;

  toDate?: string;

  limit?: number;
}

export async function getAuditLogs(
  filters: AuditFilters = {},
): Promise<AuditResponse> {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.append(key, String(value));
    }
  });

  const query = params.toString();

  return api<AuditResponse>(`/audit-logs${query ? `?${query}` : ""}`);
}
