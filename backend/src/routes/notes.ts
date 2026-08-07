import { Router } from "express";
import prisma from "../lib/prisma";
import { AuthRequest, requireAuth, requireLeadAccess } from "../middleware/auth.middleware";

const router = Router();

router.use(requireAuth);

router.post("/", async (req: AuthRequest, res) => {
  try {
    const {
      leadId,
      note,
      createdBy,
    } = req.body;

    if (!leadId || !note) {
      return res.status(400).json({
        message: "Lead ID and Note are required.",
      });
    }

    if (!(await requireLeadAccess(req, res, Number(leadId)))) {
      return;
    }

    const savedNote = await prisma.leadNote.create({
      data: {
        leadId: Number(leadId),
        note,
        createdBy: req.user!.name,
      },
    });

    // A note is a lead interaction, so refresh its read-only Last Edit value.
    await prisma.lead.update({
      where: { id: Number(leadId) },
      data: { lastEditedAt: new Date(), lastEditedBy: req.user!.name },
    });

   await prisma.leadTimeline.create({
      data: {
        leadId: Number(leadId),
        type: "NOTE",
        title: "Note Added",
      description: note,
      createdBy: req.user!.name,
      },
    });

    res.json(savedNote);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Unable to save note.",
    });
  }
});

export default router;
