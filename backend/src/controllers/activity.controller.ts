import { Request, Response } from "express";
import prisma from "../lib/prisma";

export async function getActivities(
  req: Request,
  res: Response
) {

  try {

    const rows =
      await prisma.leadTimeline.findMany({

        orderBy: {
          createdAt: "desc",
        },

        take: 100,

      });

    res.json(rows);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message:
        "Unable to load activities.",
    });

  }

}