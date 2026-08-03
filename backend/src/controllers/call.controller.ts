import { Request, Response } from "express";
import prisma from "../lib/prisma";
import { createTimeline } from "../services/timeline.service";

export async function getLeadCalls(
  req: Request,
  res: Response
) {
  try {

    const calls =
      await prisma.leadCall.findMany({
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

    const leadId =
      Number(req.params.id);

    const call =
      await prisma.leadCall.create({
        data: {
          leadId,
          callType: req.body.callType,
          duration: req.body.duration,
          remarks: req.body.remarks,
          nextFollowup:
            req.body.nextFollowup
              ? new Date(
                  req.body.nextFollowup
                )
              : null,
        },
      });

    // Logging a call counts as an edit to the related lead.
    await prisma.lead.update({
      where: { id: leadId },
      data: { lastEditedAt: new Date(), lastEditedBy: (req as any).user?.name || "System" },
    });

    await createTimeline({
      leadId,
      type: "CALL",
      title: "Call Logged",
      description:
        call.remarks || call.callType,
      createdBy: "System",
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

    const call = await prisma.leadCall.findUnique({
      where: { id: Number(req.params.callId) },
      select: { leadId: true },
    });

    if (!call) {
      return res.status(404).json({ message: "Call not found." });
    }

    await prisma.leadCall.delete({
      where: {
        id: Number(req.params.callId),
      },
    });

    await prisma.lead.update({
      where: { id: call.leadId },
      data: { lastEditedAt: new Date(), lastEditedBy: (req as any).user?.name || "System" },
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
