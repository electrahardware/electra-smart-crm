import { Request, Response } from "express";
import prisma from "../lib/prisma";
import { createTimeline } from "../services/timeline.service";

export async function getAllLeads(
  req: Request,
  res: Response
) {
  try {

    const leads =
      await prisma.lead.findMany({
        orderBy: [
  {
    leadDate: "desc",
  },
  {
    id: "desc",
  },
],
      });

    res.json(leads);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Unable to load leads.",
    });

  }
}

export async function getLead(
  req: Request,
  res: Response
) {
  try {

    const lead =
      await prisma.lead.findUnique({
        where: {
          id: Number(req.params.id),
        },
        include: {
          notesHistory: {
            orderBy: {
              createdAt: "desc",
            },
          },
        },
      });

    res.json(lead);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Unable to load lead.",
    });

  }
}

export async function createLead(
  req: Request,
  res: Response
) {
  try {

    const data = {
  ...req.body,

  leadDate:
    req.body.leadDate
      ? new Date(req.body.leadDate)
      : new Date(),

  city:
    req.body.city || "",

  followupDate:
    req.body.followupDate
      ? new Date(req.body.followupDate)
      : null,

  followupCompleted:
    req.body.followupCompleted ??
    false,

  followupCompletedAt:
    req.body.followupCompletedAt
      ? new Date(
          req.body.followupCompletedAt
        )
      : null,

  expectedValue:
  req.body.expectedValue !== "" &&
  req.body.expectedValue != null
    ? Number(req.body.expectedValue)
    : null,

probability:
  req.body.probability !== "" &&
  req.body.probability != null
    ? Number(req.body.probability)
    : 0,

};

const lead =
  await prisma.lead.create({
    data,
  });

  if (req.body.notes?.trim()) {

  await prisma.leadNote.create({

  data: {

    leadId: lead.id,

    note: req.body.notes.trim(),

    createdBy:
      (req as any).user?.name ||
      "System",

  },

});

  await createTimeline({

    leadId: lead.id,

    type: "NOTE",

    title: "Initial Note Added",

    description: req.body.notes.trim(),

    createdBy: "System",

  });

}

    await createTimeline({
      leadId: lead.id,
      type: "LEAD",
      title: "Lead Created",
      description: "New lead created.",
      createdBy: "System",
    });

    res.status(201).json(lead);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Unable to create lead.",
    });

  }
}

export async function updateLead(
  req: Request,
  res: Response
) {
  try {

    const leadId =
      Number(req.params.id);

    const lead =
      await prisma.lead.update({
        where: {
          id: leadId,
        },
        data: {
          ...req.body,

          leadDate:
  req.body.leadDate
    ? new Date(req.body.leadDate)
    : undefined,

city:
  req.body.city,

          followupCompleted:
            req.body.followupCompleted,

          followupCompletedAt:
            req.body.followupCompletedAt
              ? new Date(
                  req.body.followupCompletedAt
                )
              : undefined,

          followupDate:
            req.body.followupDate
              ? new Date(
                  req.body.followupDate
                )
              : undefined,

          expectedValue:
  req.body.expectedValue !== undefined
    ? (
        req.body.expectedValue === ""
          ? null
          : Number(req.body.expectedValue)
      )
    : undefined,

probability:
  req.body.probability !== undefined
    ? Number(req.body.probability)
    : undefined,
    
        },
      });

    if (
      req.body.followupCompleted === true
    ) {

      await createTimeline({
        leadId,
        type: "FOLLOWUP",
        title: "Follow-up Completed",
        description:
          "Customer follow-up marked as completed.",
        createdBy: "System",
      });

    }

    if (
      req.body.followupDate &&
      !req.body.followupCompleted
    ) {

      await createTimeline({
        leadId,
        type: "FOLLOWUP",
        title: "Follow-up Rescheduled",
        description:
          `Next Follow-up: ${req.body.followupDate}`,
        createdBy: "System",
      });

    }

    res.json(lead);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Unable to update lead.",
    });

  }
}

export async function deleteLead(
  req: Request,
  res: Response
) {
  try {

    await prisma.lead.delete({
      where: {
        id: Number(req.params.id),
      },
    });

    res.json({
      success: true,
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Unable to delete lead.",
    });

  }
}

export async function getLeadNotes(
  req: Request,
  res: Response
) {
  try {

    const notes =
      await prisma.leadNote.findMany({
        where: {
          leadId: Number(req.params.id),
        },
        orderBy: {
          createdAt: "desc",
        },
      });

    res.json(notes);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Unable to load notes.",
    });

  }
}

export async function addLeadNote(
  req: Request,
  res: Response
) {
  try {

    const leadId =
      Number(req.params.id);

    const note =
  await prisma.leadNote.create({

    data: {

      leadId,

      note: req.body.note,

      createdBy:
        (req as any).user?.name ||
        "System",

    },

  });

    await createTimeline({
      leadId,
      type: "NOTE",
      title: "Note Added",
      description: note.note,
      createdBy: "System",
    });

    res.status(201).json(note);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Unable to save note.",
    });

  }
}

export async function deleteLeadNote(
  req: Request,
  res: Response
) {
  try {

    await prisma.leadNote.delete({
      where: {
        id: Number(req.params.noteId),
      },
    });

    await createTimeline({
      leadId: Number(req.params.id),
      type: "NOTE",
      title: "Note Deleted",
      description: "Lead note deleted.",
      createdBy: "System",
    });

    res.json({
      success: true,
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Unable to delete note.",
    });

  }
}

export async function getTodayFollowups(
  req: Request,
  res: Response
) {
  try {

    const today = new Date();

    today.setHours(
      0,
      0,
      0,
      0
    );

    const tomorrow =
      new Date(today);

    tomorrow.setDate(
      tomorrow.getDate() + 1
    );

    const followups =
      await prisma.lead.findMany({
        where: {
          followupDate: {
            gte: today,
            lt: tomorrow,
          },
          followupCompleted: false,
        },
        orderBy: {
          followupDate: "asc",
        },
        select: {
          id: true,
          customerName: true,
          mobile: true,
          shopName: true,
          followupDate: true,
          followupTime: true,
          priority: true,
          status: true,
        },
      });

    res.json(followups);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message:
        "Unable to load today's followups.",
    });

  }
}

export async function deleteMultipleLeads(
  req: Request,
  res: Response
) {
  try {

    const { ids } = req.body;

    if (
      !Array.isArray(ids) ||
      ids.length === 0
    ) {

      return res.status(400).json({
        message: "No leads selected.",
      });

    }

    await prisma.lead.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });

    res.json({
      success: true,
      message: `${ids.length} lead(s) deleted successfully.`,
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Unable to delete selected leads.",
    });

  }
}