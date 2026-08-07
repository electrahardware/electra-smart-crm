import { Prisma } from "@prisma/client";
import { Response } from "express";
import prisma from "../lib/prisma";
import { AuthRequest } from "../middleware/auth.middleware";

export async function getDashboard(req: AuthRequest, res: Response) {
  try {
    // Keep dashboard visibility identical to the Leads page: only Sales
    // Executives are scoped to their own assigned leads.
    const leadScope: Prisma.LeadWhereInput = req.user?.role === "Sales Executive"
      ? { leadOwner: req.user.name }
      : {};
    const isSalesExecutive = req.user?.role === "Sales Executive";
    const recentLeadSelect: Prisma.LeadSelect = {
      id: true,
      customerName: true,
      shopName: true,
      status: true,
      createdAt: true,
      // A Sales Executive must never receive another lead's phone number
      // through the dashboard response, including via browser devtools.
      ...(isSalesExecutive ? {} : { mobile: true }),
    };

    const totalLeads = await prisma.lead.count({ where: leadScope });

    const wonLeads = await prisma.lead.count({
      where: {
        ...leadScope,
        status: "Won",
      },
    });

    const lostLeads = await prisma.lead.count({
      where: {
        ...leadScope,
        status: "Lost",
      },
    });

    const today = new Date();

    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);

    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayFollowups = await prisma.lead.count({
      where: {
        ...leadScope,
        followupDate: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    const overdueFollowups = await prisma.lead.count({
      where: {
        ...leadScope,
        followupDate: {
          lt: today,
        },
        followupCompleted: false,
      },
    });

    const pipeline = await prisma.lead.aggregate({
      where: leadScope,
      _sum: {
        expectedValue: true,
      },
    });

    const recentLeads = await prisma.lead.findMany({
      where: leadScope,
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
      select: recentLeadSelect,
    });

    res.json({
      totalLeads,
      wonLeads,
      lostLeads,
      todayFollowups,
      overdueFollowups,
      pipelineValue: pipeline._sum.expectedValue || 0,

      recentLeads,
    });
  } catch (error) {
    console.error("Dashboard Error:", error);

    res.status(500).json({
      message: "Unable to load dashboard.",
      error,
    });
  }
}
