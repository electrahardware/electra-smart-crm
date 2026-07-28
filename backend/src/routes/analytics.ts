import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware";
import prisma from "../lib/prisma";
import { PrismaClient } from "@prisma/client";

const router = Router();
router.use(requireAuth);


router.get("/", async (_req, res) => {
  try {

    const [
      totalLeads,
      cityWise,
      sourceWise,
      statusWise,
      priorityWise,
      leads,
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

      prisma.lead.findMany({
        select: {
          priority: true,
        },
      }),

    ]);

    let hotLeads = 0;
    let warmLeads = 0;
    let coldLeads = 0;
    let noReqLeads = 0;

    for (const lead of leads) {

      switch (lead.priority) {

        case "Hot":
          hotLeads++;
          break;

        case "Warm":
          warmLeads++;
          break;

        case "Cold":
          coldLeads++;
          break;

        case "No Req.":
          noReqLeads++;
          break;

      }

    }

    res.json({

      totalLeads,

      newToday: 0,

      hotLeads,
      warmLeads,
      coldLeads,
      noReqLeads,

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