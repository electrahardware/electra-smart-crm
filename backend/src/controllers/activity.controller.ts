import { Response } from "express";
import prisma from "../lib/prisma";
import { AuthRequest } from "../middleware/auth.middleware";

export async function getActivities(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  try {
    const where =
      req.user?.role === "Sales Executive"
        ? {
            AND: [
              { lead: { leadOwner: req.user.name } },
              { createdBy: req.user.name },
            ],
          }
        : {};

    const rows = await prisma.leadTimeline.findMany({
      where,

      select: {
        id: true,

        leadId: true,

        type: true,

        title: true,

        description: true,

        createdBy: true,

        createdAt: true,
      },

      orderBy: {
        createdAt: "desc",
      },

      take: 100,
    });

    res.json(rows);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Unable to load activities.",
    });
  }
}
