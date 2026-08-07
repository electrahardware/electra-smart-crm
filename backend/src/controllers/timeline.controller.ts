import { Response } from "express";
import prisma from "../lib/prisma";
import { AuthRequest, requireLeadAccess } from "../middleware/auth.middleware";

export async function getTimeline(req: AuthRequest, res: Response) {
  try {
    const leadId = Number(req.params.leadId);

    if (!(await requireLeadAccess(req, res, leadId))) {
      return;
    }

    const timeline = await prisma.leadTimeline.findMany({
      where: {
        leadId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(timeline);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Unable to load timeline.",
    });
  }
}

export async function addTimeline(req: AuthRequest, res: Response) {
  try {
    const leadId = Number(req.params.leadId);

    if (!(await requireLeadAccess(req, res, leadId))) {
      return;
    }

    const { type, title, description } = req.body;

    const item = await prisma.leadTimeline.create({
      data: {
        leadId,
        type,
        title,
        description,
        createdBy: req.user!.name,
      },
    });

    res.status(201).json(item);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Unable to create timeline.",
    });
  }
}
