import { Prisma } from "@prisma/client";

import prisma from "../lib/prisma";
import {
  AiLeadScoringProvider,
  type AiScoringRule,
  InternalAiLeadScoringProvider,
} from "./aiDailyLead.scoring";

const DEFAULT_RULES: Array<Pick<AiScoringRule, "key" | "label" | "weight" | "action">> = [
  { key: "CALL_BACK", label: "Callback requested", weight: 100, action: "SCORE" },
  { key: "CHECK_KRINE_KESE", label: "Customer asked to check and respond", weight: 90, action: "SCORE" },
  { key: "VISITING", label: "Visit discussion found", weight: 90, action: "SCORE" },
  { key: "PDF_SEND", label: "Product PDF requested", weight: 70, action: "SCORE" },
  { key: "INTERESTED", label: "Customer showed interest", weight: 65, action: "SCORE" },
  { key: "QUOTATION", label: "Quotation conversation found", weight: 65, action: "SCORE" },
  { key: "DEALER", label: "Dealer opportunity", weight: 65, action: "SCORE" },
  { key: "MEETING", label: "Meeting discussion found", weight: 65, action: "SCORE" },
  { key: "SAMPLE", label: "Sample discussion found", weight: 60, action: "SCORE" },
  { key: "BUSY", label: "Customer was busy", weight: 30, action: "SCORE" },
  { key: "WHENEVER_REQUIRED", label: "Customer may need follow-up", weight: 25, action: "SCORE" },
  { key: "NO_ANS", label: "Repeated no answer", weight: -20, action: "SCORE" },
  { key: "NO_REQ", label: "No requirement indicated", weight: -55, action: "SCORE" },
  { key: "SWITCH_OFF", label: "Phone switched off", weight: -35, action: "SCORE" },
  { key: "OUT_OF_NETWORK", label: "Out of network", weight: -30, action: "SCORE" },
  { key: "INVALID_NO", label: "Invalid number", weight: 0, action: "EXCLUDE" },
  { key: "PERSONAL_USE", label: "Personal use", weight: 0, action: "EXCLUDE" },
  { key: "BUSINESS_CLOSED", label: "Business closed", weight: 0, action: "EXCLUDE" },
];

const engine: AiLeadScoringProvider = new InternalAiLeadScoringProvider();

export function getIstDay(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

export function toBatchDate(day: string) {
  return new Date(`${day}T00:00:00.000Z`);
}

export async function ensureAiDailyLeadConfiguration() {
  const settings = await prisma.aiDailyLeadSettings.upsert({
    where: { id: 1 },
    create: { id: 1, batchSize: 100, generationHour: 2, timezone: "Asia/Kolkata" },
    update: {},
  });

  await prisma.$transaction(
    DEFAULT_RULES.map((rule) => prisma.aiDailyLeadScoringRule.upsert({
      where: { key: rule.key },
      create: { ...rule, isActive: true },
      update: {},
    })),
  );

  return settings;
}

async function getScoringRules() {
  await ensureAiDailyLeadConfiguration();
  return prisma.aiDailyLeadScoringRule.findMany({ orderBy: { id: "asc" } });
}

async function createBatchForExecutive(executive: { id: number; name: string }, day: string, regenerate = false) {
  const [settings, rules] = await Promise.all([
    ensureAiDailyLeadConfiguration(),
    getScoringRules(),
  ]);
  const batchDate = toBatchDate(day);

  const existing = await prisma.aiDailyLeadBatch.findUnique({
    where: { batchDate_salesExecutiveId: { batchDate, salesExecutiveId: executive.id } },
  });
  if (existing && !regenerate) return existing;

  const leads = await prisma.lead.findMany({
    where: { leadOwner: executive.name },
    include: {
      notesHistory: { orderBy: { createdAt: "desc" }, take: 20 },
      activities: { orderBy: { createdAt: "desc" }, take: 20 },
      timeline: { orderBy: { createdAt: "desc" }, take: 20 },
    },
  });

  const now = new Date();
  const candidates = leads
    .map((lead) => {
      // Status is deliberately not a ranking factor. It only excludes leads
      // that are no longer actionable, such as a business already closed.
      const closedBusiness = ["BUSINESS CLOSED", "CLOSED WON", "CLOSED LOST"]
        .includes((lead.status || "").trim().toUpperCase());
      const followupActivity = lead.timeline.find((entry) => entry.type === "FOLLOWUP")?.createdAt || null;
      const score = engine.score({
        notes: [
          ...lead.notesHistory.map((note) => note.note),
          ...(lead.notes ? [lead.notes] : []),
        ],
        activities: [
          ...lead.activities.map((activity) => `${activity.activity} ${activity.description || ""}`),
          ...lead.timeline.map((entry) => `${entry.title} ${entry.description || ""}`),
        ],
        lastFollowupAt: followupActivity || lead.followupDate || lead.lastEditedAt || null,
        now,
      }, rules);
      return { lead, score: closedBusiness ? { ...score, excluded: true } : score };
    })
    .filter((candidate) => !candidate.score.excluded)
    .sort((a, b) => b.score.score - a.score.score || a.lead.id - b.lead.id)
    .slice(0, settings.batchSize);

  return prisma.$transaction(async (tx) => {
    let batchId = existing?.id;
    if (existing) {
      await tx.aiDailyLeadBatchItem.deleteMany({ where: { batchId: existing.id } });
      await tx.aiDailyLeadBatch.update({
        where: { id: existing.id },
        data: {
          generatedAt: now,
          archivedAt: null,
          archiveStatus: "Active",
          batchSize: settings.batchSize,
          regenerationCount: { increment: 1 },
        },
      });
    } else {
      const batch = await tx.aiDailyLeadBatch.create({
        data: {
          batchDate,
          salesExecutiveId: executive.id,
          salesExecutiveName: executive.name,
          batchSize: settings.batchSize,
          generatedAt: now,
          archiveStatus: "Active",
        },
      });
      batchId = batch.id;
    }

    if (candidates.length) {
      await tx.aiDailyLeadBatchItem.createMany({
        data: candidates.map(({ lead, score }) => ({
          batchId: batchId!,
          leadId: lead.id,
          aiScore: score.score,
          aiReason: score.reason,
          reasonCategory: score.reasonCategory,
          lastNote: score.lastNote,
          lastFollowupAt: score.lastFollowupAt,
          generatedAt: now,
        })),
      });
    }

    return tx.aiDailyLeadBatch.findUniqueOrThrow({ where: { id: batchId! } });
  });
}

export async function generateAiDailyLeadBatches({ day = getIstDay(), executiveId, regenerate = false }: {
  day?: string;
  executiveId?: number;
  regenerate?: boolean;
} = {}) {
  const settings = await ensureAiDailyLeadConfiguration();
  const batchDate = toBatchDate(day);
  const executives = await prisma.user.findMany({
    where: {
      role: "Sales Executive",
      isActive: true,
      ...(executiveId ? { id: executiveId } : {}),
    },
    select: { id: true, name: true },
  });

  if (executiveId && executives.length === 0) {
    throw new Error("Sales Executive not found or inactive.");
  }

  if (!executiveId) {
    await prisma.aiDailyLeadBatch.updateMany({
      where: { batchDate: { lt: batchDate }, archiveStatus: "Active" },
      data: { archiveStatus: "Archived", archivedAt: new Date() },
    });
  }

  const batches = [];
  for (const executive of executives) {
    batches.push(await createBatchForExecutive(executive, day, regenerate));
  }

  await prisma.aiDailyLeadSettings.update({
    where: { id: settings.id },
    data: { lastGeneratedFor: batchDate },
  });
  return batches;
}

export async function ensureTodayAiDailyLeadBatches() {
  const settings = await ensureAiDailyLeadConfiguration();
  const now = new Date();
  const istHour = Number(new Intl.DateTimeFormat("en-US", { timeZone: settings.timezone, hour: "2-digit", hourCycle: "h23" }).format(now));
  const day = getIstDay(now);
  const target = toBatchDate(day);
  if (istHour >= settings.generationHour && settings.lastGeneratedFor?.getTime() !== target.getTime()) {
    return generateAiDailyLeadBatches({ day });
  }
  return [];
}

export function startAiDailyLeadScheduler() {
  void ensureTodayAiDailyLeadBatches().catch((error) => console.error("AI Daily Leads startup generation failed", error));
  setInterval(() => {
    void ensureTodayAiDailyLeadBatches().catch((error) => console.error("AI Daily Leads scheduled generation failed", error));
  }, 60_000).unref();
}

export async function getAiDailyLeadBatch(options: { user: { id: number; role: string }; executiveId?: number; day?: string }) {
  const day = options.day || getIstDay();
  const requestedExecutiveId = options.user.role === "Sales Executive" ? options.user.id : options.executiveId;
  if (!requestedExecutiveId) return null;

  return prisma.aiDailyLeadBatch.findUnique({
    where: { batchDate_salesExecutiveId: { batchDate: toBatchDate(day), salesExecutiveId: requestedExecutiveId } },
    include: {
      items: {
        orderBy: { aiScore: "desc" },
        include: { lead: true },
      },
      salesExecutive: { select: { id: true, name: true } },
    },
  });
}

export async function getAiDailyLeadArchive(options: { user: { id: number; role: string }; executiveId?: number; days: number }) {
  const executiveId = options.user.role === "Sales Executive" ? options.user.id : options.executiveId;
  const lowerBound = new Date();
  lowerBound.setUTCDate(lowerBound.getUTCDate() - options.days + 1);

  return prisma.aiDailyLeadBatch.findMany({
    where: {
      batchDate: { gte: lowerBound, lt: toBatchDate(getIstDay()) },
      ...(executiveId ? { salesExecutiveId: executiveId } : {}),
    },
    orderBy: { batchDate: "desc" },
    include: { _count: { select: { items: true } }, salesExecutive: { select: { id: true, name: true } } },
  });
}

export type AiConfigUpdate = Pick<Prisma.AiDailyLeadSettingsUpdateInput, "batchSize" | "generationHour" | "timezone">;
