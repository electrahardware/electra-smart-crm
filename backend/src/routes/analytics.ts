import { Router } from "express";
import prisma from "../lib/prisma";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

router.use(requireAuth);

router.get("/", async (_req, res) => {
  try {
    const today = new Date();

    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());

    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    const [
      totalLeads,

      todayLeads,

      yesterdayLeads,

      weekLeads,

      monthLeads,

      overdue,

      todayFollowups,

      completedToday,

      priorities,

      statuses,

      cities,

      states,

      owners,

      sources,

      monthlyTrend,
    ] = await Promise.all([
      prisma.lead.count(),

      prisma.lead.count({
        where: {
          leadDate: {
            gte: today,
            lt: tomorrow,
          },
        },
      }),

      prisma.lead.count({
        where: {
          leadDate: {
            gte: yesterday,
            lt: today,
          },
        },
      }),

      prisma.lead.count({
        where: {
          leadDate: {
            gte: weekStart,
          },
        },
      }),

      prisma.lead.count({
        where: {
          leadDate: {
            gte: monthStart,
          },
        },
      }),

      prisma.lead.count({
        where: {
          followupCompleted: false,

          followupDate: {
            lt: today,
          },
        },
      }),

      prisma.lead.count({
        where: {
          followupCompleted: false,

          followupDate: {
            gte: today,
            lt: tomorrow,
          },
        },
      }),

      prisma.lead.count({
        where: {
          followupCompleted: true,

          followupCompletedAt: {
            gte: today,
            lt: tomorrow,
          },
        },
      }),

      prisma.lead.groupBy({
        by: ["priority"],

        _count: {
          priority: true,
        },
      }),

      prisma.lead.groupBy({
        by: ["status"],

        _count: {
          status: true,
        },
      }),

      prisma.lead.groupBy({
        by: ["city"],

        _count: {
          city: true,
        },
      }),

      prisma.lead.groupBy({
        by: ["state"],

        _count: {
          state: true,
        },
      }),

      prisma.lead.groupBy({
        by: ["leadOwner"],

        _count: {
          leadOwner: true,
        },
      }),

      prisma.lead.groupBy({
        by: ["leadSource"],

        _count: {
          leadSource: true,
        },
      }),

      prisma.lead.findMany({
        where: {
          leadDate: {
            gte: new Date(today.getFullYear(), today.getMonth() - 11, 1),
          },
        },

        select: {
          leadDate: true,
        },
      }),
    ]);

    //--------------------------------------------------------
    // Priority Summary
    //--------------------------------------------------------

    let hotLeads = 0;
    let warmLeads = 0;
    let coldLeads = 0;
    let noReqLeads = 0;

    for (const row of priorities) {
      const value = (row.priority ?? "").trim().toLowerCase();

      switch (value) {
        case "hot":
          hotLeads += row._count.priority;
          break;

        case "warm":
          warmLeads += row._count.priority;
          break;

        case "cold":
          coldLeads += row._count.priority;
          break;

        case "no req.":
        case "no requirement":
        case "no req":
          noReqLeads += row._count.priority;
          break;
      }
    }

    //--------------------------------------------------------
    // Helper
    //--------------------------------------------------------

    function clean<T extends Record<string, any>>(
      rows: T[],
      field: keyof T,
      countField: string,
    ) {
      return rows
        .filter((row) => {
          const value = row[field];

          return (
            value !== null && value !== undefined && String(value).trim() !== ""
          );
        })
        .sort((a: any, b: any) => b._count[countField] - a._count[countField]);
    }

    //--------------------------------------------------------
    // Monthly Trend
    //--------------------------------------------------------

    const trendMap = new Map<string, number>();

    for (const row of monthlyTrend) {
      const d = row.leadDate;

      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
        2,
        "0",
      )}`;

      trendMap.set(key, (trendMap.get(key) ?? 0) + 1);
    }

    const monthlyData = [...trendMap.entries()]
      .map(([month, count]) => ({
        month,
        count,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    const editedLeads = await prisma.lead.findMany({
      where: {
        lastEditedAt: { not: null },
        lastEditedBy: { not: null },
      },
      select: {
        customerName: true,
        shopName: true,
        lastEditedAt: true,
        lastEditedBy: true,
      },
      orderBy: { lastEditedAt: "desc" },
    });

    const editorMap = new Map<string, { today: number; week: number; month: number; total: number }>();
    for (const lead of editedLeads) {
      if (!lead.lastEditedAt || !lead.lastEditedBy) continue;
      const row = editorMap.get(lead.lastEditedBy) ?? { today: 0, week: 0, month: 0, total: 0 };
      row.total += 1;
      if (lead.lastEditedAt >= today && lead.lastEditedAt < tomorrow) row.today += 1;
      if (lead.lastEditedAt >= weekStart) row.week += 1;
      if (lead.lastEditedAt >= monthStart) row.month += 1;
      editorMap.set(lead.lastEditedBy, row);
    }
    const salesExecutivePerformance = [...editorMap.entries()]
      .map(([user, counts]) => ({ user, ...counts }))
      .sort((a, b) => b.today - a.today || b.week - a.week || b.total - a.total);
    const todaysEditActivity = editedLeads
      .filter((lead) => lead.lastEditedAt && lead.lastEditedAt >= today && lead.lastEditedAt < tomorrow)
      .slice(0, 20)
      .map((lead) => ({ time: lead.lastEditedAt, user: lead.lastEditedBy, leadName: lead.customerName || lead.shopName || "Unnamed lead" }));

    //--------------------------------------------------------
    // Response
    //--------------------------------------------------------

    res.json({
      totalLeads,

      newToday: todayLeads,

      yesterdayLeads,

      weekLeads,

      monthLeads,

      hotLeads,

      warmLeads,

      coldLeads,

      noReqLeads,

      overdue,

      todayFollowups,

      completedToday,

      monthlyLeads: monthlyData,

      cityWise: clean(cities, "city", "city").slice(0, 15),

      stateWise: clean(states, "state", "state"),

      ownerWise: clean(owners, "leadOwner", "leadOwner"),

      sourceWise: clean(sources, "leadSource", "leadSource"),

      statusWise: clean(statuses, "status", "status"),

      priorityWise: clean(priorities, "priority", "priority"),

      salesExecutivePerformance,
      mostActiveToday: salesExecutivePerformance[0] ?? null,
      todaysEditActivity,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Unable to load analytics.",
    });
  }
});

export default router;
