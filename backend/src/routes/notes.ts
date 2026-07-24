import { Router } from "express";
import prisma from "../lib/prisma";

const router = Router();

router.post("/", async (req, res) => {
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

    const savedNote = await prisma.leadNote.create({
      data: {
        leadId: Number(leadId),
        note,
        createdBy: createdBy || "System",
      },
    });

   await prisma.leadTimeline.create({
      data: {
        leadId: Number(leadId),
        type: "NOTE",
        title: "Note Added",
        description: note,
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