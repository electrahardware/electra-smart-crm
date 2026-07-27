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

  followupCompleted:
  req.body.followupCompleted ?? false,

followupCompletedAt:
  req.body.followupCompletedAt
    ? new Date(req.body.followupCompletedAt)
    : undefined,

followupDate:
  req.body.followupCompleted === true
    ? null
    : req.body.followupDate
      ? new Date(req.body.followupDate)
      : undefined,

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

    const oldLead = await prisma.lead.findUnique({
  where: {
    id: leadId,
  },
});

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
  req.body.followupDate
    ? false
    : req.body.followupCompleted,

followupDate:
  req.body.followupDate
    ? new Date(req.body.followupDate)
    : null,

followupTime:
  req.body.followupDate
    ? req.body.followupTime
    : null,

followupCompletedAt:
  req.body.followupCompleted
    ? new Date()
    : req.body.followupDate
      ? null
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
  req.body.notes?.trim() &&
  req.body.notes !== oldLead?.notes
) {

  let latestNote = req.body.notes.trim();

  if (oldLead?.notes?.trim()) {

    latestNote = req.body.notes
      .replace(oldLead.notes, "")
      .trim();

  }

  if (latestNote.trim()) {

  await prisma.leadNote.create({

    data: {

      leadId,

      note: latestNote,

      createdBy:
        (req as any).user?.name ||
        "System",

    },

  });

}

  await createTimeline({

    leadId,

    type: "NOTE",

    title: "Note Added",

    description: latestNote,

    createdBy: "System",

  });

}

    if (
  oldLead?.followupDate &&
  !req.body.followupDate
) {

  await createTimeline({
    leadId,
    type: "FOLLOWUP",
    title: "Follow-up Date Removed",
    description: "Follow-up Date set to None.",
    createdBy: "System",
  });

}

else if (req.body.followupDate) {

  await createTimeline({
    leadId,
    type: "FOLLOWUP",
    title: "Follow-up Updated",
    description: `Next Follow-up Date: ${req.body.followupDate}`,
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

  await prisma.lead.update({
  where: {
    id: leadId,
  },
  data: {
    notes: req.body.note,
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

    const latestNote = await prisma.leadNote.findFirst({

  where: {
    leadId: Number(req.params.id),
  },

  orderBy: {
    createdAt: "desc",
  },

});

await prisma.lead.update({

  where: {
    id: Number(req.params.id),
  },

  data: {

    notes: latestNote?.note || "",

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

export async function getFollowups(
  req: Request,
  res: Response
) {
  try {

    const filter =
      (req.query.filter as string) || "today";

    const today = new Date();

    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);

    tomorrow.setDate(today.getDate() + 1);

    let where: any = {
      followupCompleted: false,
    };

    if (filter === "today") {

      where.followupDate = {
        gte: today,
        lt: tomorrow,
      };

    }

    if (filter === "overdue") {

      where.followupDate = {
        lt: today,
      };

    }

    const followups =
      await prisma.lead.findMany({

        where,

        orderBy: [
          {
            followupDate: "asc",
          },
          {
            followupTime: "asc",
          },
        ],

      });

    return res.json(followups);

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      message: "Failed to load followups",
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

export async function completeFollowup(
  req: Request,
  res: Response
) {
  try {

    const leadId = Number(req.params.id);

    const {
      note,
      followupDate,
    } = req.body;

    // Save latest note
    if (note?.trim()) {

  await prisma.lead.update({

    where: {
      id: leadId,
    },

    data: {
      notes: note.trim(),
    },

  });

  await prisma.leadNote.create({

    data: {

      leadId,

      note: note.trim(),

      createdBy:
        (req as any).user?.name ||
        "System",

    },

  });

  await createTimeline({

  leadId,

  type: "NOTE",

  title: "Note Added",

  description: note.trim(),

  createdBy:
    (req as any).user?.name ||
    "System",

});

}

    // If follow-up date exists,
    // keep lead active.
    if (followupDate) {

      await prisma.lead.update({

        where: {
          id: leadId,
        },

        data: {

          followupDate: new Date(followupDate),

          followupCompleted: false,

          followupCompletedAt: null,

        },

      });

      await createTimeline({

        leadId,

        type: "FOLLOWUP",

        title: "Follow-up Updated",

        description: `Next Follow-up Date: ${followupDate}`,

        createdBy:
          (req as any).user?.name ||
          "System",

      });

    } else {

      // No next follow-up.
      // Mark complete.

      await prisma.lead.update({

        where: {
          id: leadId,
        },

        data: {

          followupCompleted: true,

          followupCompletedAt: new Date(),

          followupDate: null,

          followupTime: null,

        },

      });


    }

    res.json({
      success: true,
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({

      message:
        "Unable to complete follow-up.",

    });

  }
}

export async function createQuickLead(
  req: Request,
  res: Response
) {
  try {

    const {
      mobile,
      leadOwner,
      note,
    } = req.body;

    if (!mobile?.trim()) {
      return res.status(400).json({
        message: "Mobile number is required.",
      });
    }

    const existing =
      await prisma.lead.findFirst({
        where: {
          mobile,
        },
      });

    if (existing) {
      return res.status(409).json({
        message: "Lead already exists.",
        leadId: existing.id,
      });
    }

    const lead =
      await prisma.lead.create({

        data: {

          customerName: "",

          shopName: "",

          mobile,

          whatsapp: mobile,

          leadOwner:
            leadOwner || "",

          leadSource: "WhatsApp",

          status: "New",

          leadDate: new Date(),

          followupDate: new Date(),

          followupCompleted: false,

          notes: note?.trim() || "",

        },

      });

    if (note?.trim()) {

      await prisma.leadNote.create({

        data: {

          leadId: lead.id,

          note,

          createdBy:
            (req as any).user?.name ||
            "System",

        },

      });

      await createTimeline({

  leadId: lead.id,

  type: "NOTE",

  title: "Initial Note Added",

  description: note.trim(),

  createdBy:
    (req as any).user?.name ||
    "System",

});

    }
    

    await createTimeline({

      leadId: lead.id,

      type: "LEAD",

      title: "Quick Lead Created",

      description:
        "Lead created from WhatsApp.",

      createdBy:
        (req as any).user?.name ||
        "System",

    });

    res.status(201).json(lead);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Unable to create quick lead.",
    });

  }
}

export async function createQuickBulkLead(
  req: Request,
  res: Response
) {
  try {

    const {
  numbers = [],
  leadOwner,
} = req.body;

    let created = 0;
    let duplicates = 0;
    let invalid = 0;

    for (const raw of numbers) {

      const mobile = raw.trim();

      if (!/^\d{10}$/.test(mobile)) {
        invalid++;
        continue;
      }

      const exists = await prisma.lead.findFirst({
        where: {
          mobile,
        },
      });

      if (exists) {
        duplicates++;
        continue;
      }

      await prisma.lead.create({

        data: {

          customerName: "",

          shopName: "",

          mobile,

          whatsapp: mobile,

          leadOwner: leadOwner || "",

          leadSource: "WhatsApp",

          status: "New",

          leadDate: new Date(),

          followupDate: new Date(),

          followupCompleted: false,

        },

      });

      created++;

    }

    res.json({

      created,
      duplicates,
      invalid,

    });

  } catch (error) {

    console.error(error);

    res.status(500).json({

      message:
        "Unable to create quick leads.",

    });

  }
}

export async function getNewLeadsToday(
  req: Request,
  res: Response
) {
  try {

    const today = new Date();

    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);

    tomorrow.setDate(today.getDate() + 1);

    const leads = await prisma.lead.findMany({

      where: {

        createdAt: {

          gte: today,

          lt: tomorrow,

        },

      },

      orderBy: {

        createdAt: "desc",

      },

    });

    return res.json(leads);

  } catch (error) {

    console.error(error);

    return res.status(500).json({

      message: "Failed to load today's leads",

    });

  }
}

export async function getNotifications(
  req: Request,
  res: Response
) {
  try {
    const today = new Date();

    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);

    tomorrow.setDate(today.getDate() + 1);

    const overdue = await prisma.lead.count({
      where: {
        followupCompleted: false,
        followupDate: {
          lt: today,
        },
      },
    });

    const todayFollowups = await prisma.lead.count({
      where: {
        followupCompleted: false,
        followupDate: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    const newLeads = await prisma.lead.count({
      where: {
        createdAt: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    return res.json({
      overdue,
      today: todayFollowups,
      newLeads,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to load notifications",
    });
  }
}