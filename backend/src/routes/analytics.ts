import { Router } from "express";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

router.get("/", async (_req, res) => {
  try {
    const [
  totalLeads,
  cityWise,
  sourceWise,
  statusWise,
  priorityWise,
  
] = await Promise.all([

      // Total Leads
      prisma.lead.count(),

      // Top Cities
      prisma.lead.groupBy({
        by: ["city"],
        where: {
          city: {
            not: null,
          },
        },
        _count: {
          city: true,
        },
        orderBy: {
          _count: {
            city: "desc",
          },
        },
        take: 10,
      }),

      

      // Lead Sources
      prisma.lead.groupBy({
        by: ["leadSource"],
        where: {
          leadSource: {
            not: null,
          },
        },
        _count: {
          leadSource: true,
        },
        orderBy: {
          _count: {
            leadSource: "desc",
          },
        },
      }),

      // Status
      prisma.lead.groupBy({
        by: ["status"],
        where: {
          status: {
            not: null,
          },
        },
        _count: {
          status: true,
        },
        orderBy: {
          _count: {
            status: "desc",
          },
        },
      }),

      // Priority
      prisma.lead.groupBy({
  by: ["priority"],
  where: {
    priority: {
      not: null,
    },
  },
  _count: {
    priority: true,
  },
  orderBy: {
    _count: {
      priority: "desc",
    },
  },
}),

    ]);

    res.json({
      totalLeads,

      newToday: 0,
      hotLeads: 0,
      warmLeads: 0,
      coldLeads: 0,

      overdue: 0,
      todayFollowups: 0,
      completedToday: 0,

      monthlyLeads: [],

      cityWise,

      stateWise: [],

      ownerWise: [],

      sourceWise,

      statusWise,

      priorityWise,
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Analytics Error",
    });

  }
});

export default router;