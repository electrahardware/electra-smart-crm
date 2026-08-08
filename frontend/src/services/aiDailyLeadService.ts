import { api } from "../lib/api";
import type { Lead } from "../types/lead";

export type AiDailyLeadItem = {
  id: string;
  aiScore: number;
  aiReason: string;
  reasonCategory: string;
  lastNote: string | null;
  lastFollowupAt: string | null;
  generatedAt: string;
  completedAt: string | null;
  lead: Lead;
};
export type AiDailyLeadResponse = {
  batch: null | { id: string; batchDate: string; generatedAt: string; archiveStatus: string; batchSize: number; salesExecutive: { id: number; name: string } };
  items: AiDailyLeadItem[];
  stats: { total: number; completed: number; remaining: number; completionPercent: number; averageScore: number };
};
export type AiExecutive = { id: number; name: string; email: string };
export type AiScoringRule = { id: number; key: string; label: string; weight: number; action: string; isActive: boolean };
export type AiConfiguration = { settings: { batchSize: number; generationHour: number; timezone: string }; rules: AiScoringRule[] };

export function getAiDailyLeads(executiveId?: number) { return api<AiDailyLeadResponse>(`/ai-daily-leads${executiveId ? `?executiveId=${executiveId}` : ""}`); }
export function getAiDailyLeadExecutives() { return api<AiExecutive[]>("/ai-daily-leads/executives"); }
export function completeAiDailyLead(itemId: string) { return api<AiDailyLeadItem>(`/ai-daily-leads/items/${itemId}/complete`, { method: "POST" }); }
export function regenerateAiDailyLeads(executiveId: number) { return api<{ message: string }>(`/ai-daily-leads/regenerate/${executiveId}`, { method: "POST" }); }
export function getAiDailyLeadArchive(days: 1 | 7 | 30, executiveId?: number) {
  const params = new URLSearchParams({ days: String(days) }); if (executiveId) params.set("executiveId", String(executiveId));
  return api<Array<{ id: string; batchDate: string; generatedAt: string; archiveStatus: string; salesExecutive: { id: number; name: string }; _count: { items: number } }>>(`/ai-daily-leads/archive?${params}`);
}
export function getAiConfiguration() { return api<AiConfiguration>("/ai-daily-leads/configuration"); }
export function updateAiConfiguration(values: { batchSize: number; generationHour: number }) { return api<AiConfiguration["settings"]>("/ai-daily-leads/configuration", { method: "PUT", body: JSON.stringify(values) }); }
export function updateAiRules(rules: Array<Pick<AiScoringRule, "id" | "weight" | "isActive">>) { return api<AiScoringRule[]>("/ai-daily-leads/configuration/rules", { method: "PUT", body: JSON.stringify({ rules }) }); }
