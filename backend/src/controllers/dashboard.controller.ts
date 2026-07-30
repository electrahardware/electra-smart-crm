import { Request, Response } from "express";
import prisma from "../lib/prisma";

export async function getDashboard(req: Request, res: Response) {
  try {
    const totalLeads = await prisma.lead.count();

    const hotLeads = await prisma.lead.count({
      where: {
        priority: "Hot",
      },
    });

    const wonLeads = await prisma.lead.count({
      where: {
        status: "Won",
      },
    });

    const lostLeads = await prisma.lead.count({
      where: {
        status: "Lost",
      },
    });

    const today = new Date();

    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);

    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayFollowups = await prisma.lead.count({
      where: {
        followupDate: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    const overdueFollowups = await prisma.lead.count({
      where: {
        followupDate: {
          lt: today,
        },
        followupCompleted: false,
      },
    });

    const pipeline = await prisma.lead.aggregate({
      _sum: {
        expectedValue: true,
      },
    });

    const recentLeads = await prisma.lead.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
      select: {
        id: true,
        customerName: true,
        shopName: true,
        mobile: true,
        status: true,
        priority: true,
        createdAt: true,
      },
    });

    res.json({
      totalLeads,
      hotLeads,
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
