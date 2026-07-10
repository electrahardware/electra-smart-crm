import { Request, Response } from "express";
import prisma from "../lib/prisma";

export async function getTimeline(
  req: Request,
  res: Response
) {
  try {

    const leadId = Number(
      req.params.leadId
    );

    const timeline =
      await prisma.leadTimeline.findMany({
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
      message:
        "Unable to load timeline.",
    });

  }
}

export async function addTimeline(
  req: Request,
  res: Response
) {
  try {

    const leadId = Number(
      req.params.leadId
    );

    const {
      type,
      title,
      description,
      createdBy,
    } = req.body;

    const item =
      await prisma.leadTimeline.create({
        data: {
          leadId,
          type,
          title,
          description,
          createdBy,
        },
      });

    res.status(201).json(item);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message:
        "Unable to create timeline.",
    });

  }
}