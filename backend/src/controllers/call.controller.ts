import { Request, Response } from "express";
import prisma from "../lib/prisma";

export async function getLeadCalls(
  req: Request,
  res: Response
) {
  try {
    const calls = await prisma.leadCall.findMany({
      where: {
        leadId: Number(req.params.id),
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(calls);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Unable to load calls.",
    });
  }
}

export async function addLeadCall(
  req: Request,
  res: Response
) {
  try {
    const call = await prisma.leadCall.create({
      data: {
        leadId: Number(req.params.id),
        callType: req.body.callType,
        duration: req.body.duration,
        remarks: req.body.remarks,
        nextFollowup: req.body.nextFollowup
          ? new Date(req.body.nextFollowup)
          : null,
      },
    });

    res.status(201).json(call);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Unable to save call.",
    });
  }
}

export async function deleteLeadCall(
  req: Request,
  res: Response
) {
  try {
    await prisma.leadCall.delete({
      where: {
        id: Number(req.params.callId),
      },
    });

    res.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Unable to delete call.",
    });
  }
}