import { Request, Response } from "express";

import prisma from "../lib/prisma";
import { AuthRequest, isLeadPrivileged } from "../middleware/auth.middleware";
import {
  ensureAiDailyLeadConfiguration,
  ensureTodayAiDailyLeadBatches,
  generateAiDailyLeadBatches,
  getAiDailyLeadArchive,
  getAiDailyLeadBatch,
  getIstDay,
  toBatchDate,
} from "../services/aiDailyLead.service";

function parseExecutiveId(value: unknown) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
}

export async function getTodayAiDailyLeads(req: AuthRequest, res: Response) {
  try {
    await ensureTodayAiDailyLeadBatches();
    const executiveId = parseExecutiveId(req.query.executiveId);
    if (isLeadPrivileged(req.user?.role) && !executiveId) {
      const batches = await prisma.aiDailyLeadBatch.findMany({
        where: { batchDate: toBatchDate(getIstDay()), archiveStatus: "Active" },
        include: { items: { orderBy: { aiScore: "desc" }, include: { lead: true } } },
      });
      const items = batches.flatMap((batch) => batch.items).sort((a, b) => b.aiScore - a.aiScore);
      const completed = items.filter((item) => item.completedAt).length;
      const total = items.length;
      return res.json({ batch: null, items, stats: { total, completed, remaining: total - completed, completionPercent: total ? Math.round((completed / total) * 100) : 0, averageScore: total ? Math.round(items.reduce((sum, item) => sum + item.aiScore, 0) / total) : 0 } });
    }
    const batch = await getAiDailyLeadBatch({ user: req.user!, executiveId });
    if (!batch) return res.json({ batch: null, items: [], stats: { total: 0, completed: 0, remaining: 0, completionPercent: 0, averageScore: 0 } });

    const completed = batch.items.filter((item) => item.completedAt).length;
    const total = batch.items.length;
    return res.json({
      batch: { id: batch.id, batchDate: batch.batchDate, generatedAt: batch.generatedAt, archiveStatus: batch.archiveStatus, salesExecutive: batch.salesExecutive, batchSize: batch.batchSize },
      items: batch.items,
      stats: {
        total,
        completed,
        remaining: total - completed,
        completionPercent: total ? Math.round((completed / total) * 100) : 0,
        averageScore: total ? Math.round(batch.items.reduce((sum, item) => sum + item.aiScore, 0) / total) : 0,
      },
    });
  } catch (error) {
    console.error("Unable to load AI Daily Leads", error);
    return res.status(500).json({ message: "Unable to load AI Daily Leads." });
  }
}

export async function getAiDailyLeadExecutives(_req: AuthRequest, res: Response) {
  try {
    return res.json(await prisma.user.findMany({ where: { role: "Sales Executive", isActive: true }, select: { id: true, name: true, email: true }, orderBy: { name: "asc" } }));
  } catch (error) {
    console.error("Unable to load Sales Executives", error);
    return res.status(500).json({ message: "Unable to load Sales Executives." });
  }
}

export async function completeAiDailyLead(req: AuthRequest, res: Response) {
  try {
    const item = await prisma.aiDailyLeadBatchItem.findUnique({ where: { id: String(req.params.itemId) } });
    if (!item) return res.status(404).json({ message: "AI Daily Lead item not found." });
    const batch = await prisma.aiDailyLeadBatch.findUnique({ where: { id: item.batchId }, select: { salesExecutiveId: true } });
    if (!batch) return res.status(404).json({ message: "AI Daily Lead batch not found." });
    if (!isLeadPrivileged(req.user?.role) && batch.salesExecutiveId !== req.user?.id) return res.status(403).json({ message: "You do not have access to this AI Daily Lead." });
    return res.json(await prisma.aiDailyLeadBatchItem.update({ where: { id: item.id }, data: { completedAt: item.completedAt || new Date() } }));
  } catch (error) {
    console.error("Unable to complete AI Daily Lead", error);
    return res.status(500).json({ message: "Unable to complete AI Daily Lead." });
  }
}

export async function regenerateAiDailyLeadBatch(req: AuthRequest, res: Response) {
  try {
    const executiveId = parseExecutiveId(req.params.executiveId);
    if (!executiveId) return res.status(400).json({ message: "A valid Sales Executive is required." });
    const [batch] = await generateAiDailyLeadBatches({ executiveId, regenerate: true });
    return res.json({ message: "AI Daily Leads batch regenerated.", batch });
  } catch (error) {
    console.error("Unable to regenerate AI Daily Leads", error);
    return res.status(500).json({ message: error instanceof Error ? error.message : "Unable to regenerate AI Daily Leads." });
  }
}

export async function getAiDailyLeadArchiveController(req: AuthRequest, res: Response) {
  try {
    const requestedDays = Number(req.query.days) || 7;
    const days = [1, 7, 30].includes(requestedDays) ? requestedDays : 7;
    return res.json(await getAiDailyLeadArchive({ user: req.user!, executiveId: parseExecutiveId(req.query.executiveId), days }));
  } catch (error) {
    console.error("Unable to load AI Daily Leads archive", error);
    return res.status(500).json({ message: "Unable to load AI Daily Leads archive." });
  }
}

export async function getAiDailyLeadConfig(_req: Request, res: Response) {
  try {
    const [settings, rules] = await Promise.all([ensureAiDailyLeadConfiguration(), prisma.aiDailyLeadScoringRule.findMany({ orderBy: { id: "asc" } })]);
    return res.json({ settings, rules });
  } catch (error) {
    console.error("Unable to load AI Daily Leads configuration", error);
    return res.status(500).json({ message: "Unable to load AI Daily Leads configuration." });
  }
}

export async function updateAiDailyLeadConfig(req: Request, res: Response) {
  try {
    const batchSize = Number(req.body.batchSize);
    const generationHour = Number(req.body.generationHour);
    if (!Number.isInteger(batchSize) || batchSize < 1 || batchSize > 5000) return res.status(400).json({ message: "Batch size must be between 1 and 5000." });
    if (!Number.isInteger(generationHour) || generationHour < 0 || generationHour > 23) return res.status(400).json({ message: "Generation hour must be between 0 and 23." });
    return res.json(await prisma.aiDailyLeadSettings.upsert({ where: { id: 1 }, create: { id: 1, batchSize, generationHour, timezone: "Asia/Kolkata" }, update: { batchSize, generationHour } }));
  } catch (error) {
    console.error("Unable to update AI Daily Leads settings", error);
    return res.status(500).json({ message: "Unable to update AI Daily Leads settings." });
  }
}

export async function updateAiDailyLeadRules(req: Request, res: Response) {
  try {
    const rules = req.body.rules;
    if (!Array.isArray(rules)) return res.status(400).json({ message: "Rules must be provided as an array." });
    await prisma.$transaction(rules.map((rule: { id?: number; weight?: number; isActive?: boolean }) => {
      if (!Number.isInteger(rule.id) || !Number.isInteger(Number(rule.weight))) throw new Error("Each rule must include a valid id and whole-number weight.");
      return prisma.aiDailyLeadScoringRule.update({ where: { id: rule.id }, data: { weight: Number(rule.weight), isActive: Boolean(rule.isActive) } });
    }));
    return res.json(await prisma.aiDailyLeadScoringRule.findMany({ orderBy: { id: "asc" } }));
  } catch (error) {
    console.error("Unable to update AI Daily Leads rules", error);
    return res.status(400).json({ message: error instanceof Error ? error.message : "Unable to update AI Daily Leads rules." });
  }
}

/** GitHub Actions uses this protected internal endpoint at 02:00 Asia/Kolkata. */
export async function runScheduledAiDailyLeadGeneration(req: Request, res: Response) {
  const expectedSecret = process.env.AI_DAILY_LEADS_SCHEDULER_SECRET || process.env.BACKUP_WORKFLOW_SECRET;
  if (!expectedSecret || req.header("x-ai-scheduler-secret") !== expectedSecret) {
    return res.status(401).json({ message: "Unauthorized scheduler request." });
  }

  try {
    const batches = await generateAiDailyLeadBatches();
    return res.json({ success: true, generatedBatches: batches.length });
  } catch (error) {
    console.error("Scheduled AI Daily Leads generation failed", error);
    return res.status(500).json({ message: "Scheduled AI Daily Leads generation failed." });
  }
}
