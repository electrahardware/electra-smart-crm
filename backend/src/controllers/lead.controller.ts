import { Prisma } from "@prisma/client";
import { Request, Response } from "express";
import prisma from "../lib/prisma";
import { createAuditLog } from "../services/audit.service";
import { createTimeline } from "../services/timeline.service";

async function verifyLeadAccess(req: Request, leadId: number) {
  const currentUser = (req as any).user;

  if (currentUser.role === "Owner" || currentUser.role === "Sales Manager") {
    return true;
  }

  const lead = await prisma.lead.findUnique({
    where: {
      id: leadId,
    },
    select: {
      leadOwner: true,
    },
  });

  if (!lead) {
    return false;
  }

  return lead.leadOwner === currentUser.name;
}

export async function getAllLeads(req: Request, res: Response) {
  try {
    const page = Number(req.query.page) || 1;

    const limit = Number(req.query.limit) || 50;

    const skip = (page - 1) * limit;

    const search = (req.query.search as string)?.trim() || "";

    const status = (req.query.status as string)?.trim() || "";

    const owner = (req.query.owner as string)?.trim() || "";

    const priority = (req.query.priority as string)?.trim() || "";

    const state = (req.query.state as string)?.trim() || "";

    const source = (req.query.source as string)?.trim() || "";

    const cities = ((req.query.cities as string) || "")
      .split(",")
      .map((city) => city.trim())
      .filter(Boolean);

    const fromDate = (req.query.fromDate as string)?.trim() || "";

    const toDate = (req.query.toDate as string)?.trim() || "";

    const followup = (req.query.followup as string)?.trim() || "";

    const where: Prisma.LeadWhereInput = {};

    const currentUser = (req as any).user;

    // ------------------------
    // Role Based Access
    // ------------------------

    if (currentUser.role === "Sales Executive") {
      where.leadOwner = currentUser.name;
    }

    if (search) {
      where.OR = [
        {
          customerName: {
            contains: search,
            mode: Prisma.QueryMode.insensitive,
          },
        },
        {
          shopName: {
            contains: search,
            mode: Prisma.QueryMode.insensitive,
          },
        },
        {
          mobile: {
            contains: search,
          },
        },
        {
          whatsapp: {
            contains: search,
          },
        },
        {
          city: {
            contains: search,
            mode: Prisma.QueryMode.insensitive,
          },
        },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (owner) {
      where.leadOwner = owner;
    }

    if (priority) {
      where.priority = priority;
    }

    if (state) {
      where.state = state;
    }

    if (source) {
      where.leadSource = source;
    }

    // ------------------------
    // City Filter
    // ------------------------

    if (cities.length > 0) {
      where.city = {
        in: cities,
      };
    }

    // ------------------------
    // Lead Date Filter
    // ------------------------

    if (fromDate || toDate) {
      where.leadDate = {};

      if (fromDate) {
        where.leadDate.gte = new Date(fromDate);
      }

      if (toDate) {
        const end = new Date(toDate);

        end.setHours(23, 59, 59, 999);

        where.leadDate.lte = end;
      }
    }

    // ------------------------
    // Follow-up Filter
    // ------------------------

    const today = new Date();

    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);

    tomorrow.setDate(today.getDate() + 1);

    if (followup === "Today") {
      where.followupCompleted = false;

      where.followupDate = {
        gte: today,
        lt: tomorrow,
      };
    }

    if (followup === "Upcoming") {
      where.followupCompleted = false;

      where.followupDate = {
        gte: tomorrow,
      };
    }

    if (followup === "Overdue") {
      where.followupCompleted = false;

      where.followupDate = {
        lt: today,
      };
    }

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,

        skip,

        take: limit,

        orderBy: [
          {
            leadDate: "desc",
          },

          {
            id: "desc",
          },
        ],
      }),

      prisma.lead.count({
        where,
      }),
    ]);

    res.json({
      data: leads,

      total,

      page,

      limit,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Unable to load leads.",
    });
  }
}

export async function getLead(req: Request, res: Response) {
  try {
    const leadId = Number(req.params.id);

    const allowed = await verifyLeadAccess(req, leadId);

    if (!allowed) {
      return res.status(403).json({
        message: "Access denied.",
      });
    }
    const lead = await prisma.lead.findUnique({
      where: {
        id: leadId,
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

export async function createLead(req: Request, res: Response) {
  try {
    const data = {
      ...req.body,

      leadDate: req.body.leadDate ? new Date(req.body.leadDate) : new Date(),

      city: req.body.city || "",

      followupCompleted: req.body.followupCompleted ?? false,

      followupCompletedAt: req.body.followupCompletedAt
        ? new Date(req.body.followupCompletedAt)
        : undefined,

      followupDate:
        req.body.followupCompleted === true
          ? null
          : req.body.followupDate
            ? new Date(req.body.followupDate)
            : undefined,

      expectedValue:
        req.body.expectedValue !== "" && req.body.expectedValue != null
          ? Number(req.body.expectedValue)
          : null,

      probability:
        req.body.probability !== "" && req.body.probability != null
          ? Number(req.body.probability)
          : 0,
    };

    const lead = await prisma.lead.create({
      data,
    });

    if (req.body.notes?.trim()) {
      await prisma.leadNote.create({
        data: {
          leadId: lead.id,

          note: req.body.notes.trim(),

          createdBy: (req as any).user?.name || "System",
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

    await createAuditLog({
      module: "Lead",
      action: "CREATE",

      userId: (req as any).user?.id,
      userName: (req as any).user?.name || "System",

      entityId: lead.id,
      entityName: lead.customerName,

      newValues: lead,

      ipAddress: req.ip,
    });

    res.status(201).json(lead);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Unable to create lead.",
    });
  }
}

export async function updateLead(req: Request, res: Response) {
  try {
    const leadId = Number(req.params.id);

    const allowed = await verifyLeadAccess(req, leadId);

    if (!allowed) {
      return res.status(403).json({
        message: "Access denied.",
      });
    }

    const oldLead = await prisma.lead.findUnique({
      where: {
        id: leadId,
      },
    });

    const {
      notesHistory,
      timeline,
      activities,
      attachments,
      calls,
      quotations,
      createdAt,
      updatedAt,
      id,
      ...leadData
    } = req.body;

    const lead = await prisma.lead.update({
      where: {
        id: leadId,
      },
      data: {
        ...leadData,

        leadDate: req.body.leadDate ? new Date(req.body.leadDate) : undefined,

        city: req.body.city,

        followupCompleted: req.body.followupDate
          ? false
          : req.body.followupCompleted,

        followupDate: req.body.followupDate
          ? new Date(req.body.followupDate)
          : null,

        followupTime: req.body.followupDate ? req.body.followupTime : null,

        followupCompletedAt: req.body.followupCompleted
          ? new Date()
          : req.body.followupDate
            ? null
            : undefined,

        expectedValue:
          req.body.expectedValue !== undefined
            ? req.body.expectedValue === ""
              ? null
              : Number(req.body.expectedValue)
            : undefined,

        probability:
          req.body.probability !== undefined
            ? Number(req.body.probability)
            : undefined,
      },
    });

    if (req.body.notes?.trim() && req.body.notes !== oldLead?.notes) {
      let latestNote = req.body.notes.trim();

      if (oldLead?.notes?.trim()) {
        latestNote = req.body.notes.replace(oldLead.notes, "").trim();
      }

      if (latestNote.trim()) {
        await prisma.leadNote.create({
          data: {
            leadId,

            note: latestNote,

            createdBy: (req as any).user?.name || "System",
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

    if (oldLead?.followupDate && !req.body.followupDate) {
      await createTimeline({
        leadId,
        type: "FOLLOWUP",
        title: "Follow-up Date Removed",
        description: "Follow-up Date set to None.",
        createdBy: "System",
      });
    } else if (req.body.followupDate) {
      await createTimeline({
        leadId,
        type: "FOLLOWUP",
        title: "Follow-up Updated",
        description: `Next Follow-up Date: ${req.body.followupDate}`,
        createdBy: "System",
      });
    }

    await createAuditLog({
      module: "Lead",
      action: "UPDATE",

      userId: (req as any).user?.id,
      userName: (req as any).user?.name || "System",

      entityId: lead.id,
      entityName: lead.customerName,

      oldValues: oldLead,
      newValues: lead,

      ipAddress: req.ip,
    });

    res.json(lead);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Unable to update lead.",
    });
  }
}

export async function deleteLead(req: Request, res: Response) {
  try {
    const leadId = Number(req.params.id);

    const allowed = await verifyLeadAccess(req, leadId);

    if (!allowed) {
      return res.status(403).json({
        message: "Access denied.",
      });
    }
    const lead = await prisma.lead.findUnique({
      where: {
        id: leadId,
      },
    });

    if (!lead) {
      return res.status(404).json({
        message: "Lead not found.",
      });
    }

    await prisma.lead.delete({
      where: {
        id: leadId,
      },
    });

    await createAuditLog({
      module: "Lead",
      action: "DELETE",

      userId: (req as any).user?.id,
      userName: (req as any).user?.name || "System",

      entityId: lead?.id,
      entityName: lead?.customerName,

      oldValues: lead,

      ipAddress: req.ip,
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

export async function getLeadNotes(req: Request, res: Response) {
  try {
    const leadId = Number(req.params.id);

    const allowed = await verifyLeadAccess(req, leadId);

    if (!allowed) {
      return res.status(403).json({
        message: "Access denied.",
      });
    }
    const notes = await prisma.leadNote.findMany({
      where: {
        leadId: leadId,
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

export async function addLeadNote(req: Request, res: Response) {
  try {
    const leadId = Number(req.params.id);

    const allowed = await verifyLeadAccess(req, leadId);

    if (!allowed) {
      return res.status(403).json({
        message: "Access denied.",
      });
    }

    const note = await prisma.leadNote.create({
      data: {
        leadId,

        note: req.body.note,

        createdBy: (req as any).user?.name || "System",
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

export async function deleteLeadNote(req: Request, res: Response) {
  try {
    const leadId = Number(req.params.id);

    const allowed = await verifyLeadAccess(req, leadId);

    if (!allowed) {
      return res.status(403).json({
        message: "Access denied.",
      });
    }
    await prisma.leadNote.delete({
      where: {
        id: Number(req.params.noteId),
      },
    });

    const latestNote = await prisma.leadNote.findFirst({
      where: {
        leadId: leadId,
      },

      orderBy: {
        createdAt: "desc",
      },
    });

    await prisma.lead.update({
      where: {
        id: leadId,
      },

      data: {
        notes: latestNote?.note || "",
      },
    });

    await createTimeline({
      leadId: leadId,
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

export async function getFollowups(req: Request, res: Response) {
  try {
    const filter = (req.query.filter as string) || "today";

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

    const followups = await prisma.lead.findMany({
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

export async function deleteMultipleLeads(req: Request, res: Response) {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
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

export async function completeFollowup(req: Request, res: Response) {
  try {
    const leadId = Number(req.params.id);
    const allowed = await verifyLeadAccess(req, leadId);

    if (!allowed) {
      return res.status(403).json({
        message: "Access denied.",
      });
    }
    const { note, followupDate } = req.body;

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

          createdBy: (req as any).user?.name || "System",
        },
      });

      await createTimeline({
        leadId,

        type: "NOTE",

        title: "Note Added",

        description: note.trim(),

        createdBy: (req as any).user?.name || "System",
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

        createdBy: (req as any).user?.name || "System",
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
  } catch (error: any) {
    console.error("========== UPDATE ERROR ==========");
    console.error(error);
    console.error(error.message);
    console.error(error.code);
    console.error(error.meta);

    return res.status(500).json({
      message: error.message,
      code: error.code,
      meta: error.meta,
    });
  }
}

export async function createQuickLead(req: Request, res: Response) {
  try {
    const { mobile, leadOwner, note } = req.body;

    if (!mobile?.trim()) {
      return res.status(400).json({
        message: "Mobile number is required.",
      });
    }

    const existing = await prisma.lead.findFirst({
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

    const lead = await prisma.lead.create({
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

        notes: note?.trim() || "",
      },
    });

    if (note?.trim()) {
      await prisma.leadNote.create({
        data: {
          leadId: lead.id,

          note,

          createdBy: (req as any).user?.name || "System",
        },
      });

      await createTimeline({
        leadId: lead.id,

        type: "NOTE",

        title: "Initial Note Added",

        description: note.trim(),

        createdBy: (req as any).user?.name || "System",
      });
    }

    await createTimeline({
      leadId: lead.id,

      type: "LEAD",

      title: "Quick Lead Created",

      description: "Lead created from WhatsApp.",

      createdBy: (req as any).user?.name || "System",
    });

    res.status(201).json(lead);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Unable to create quick lead.",
    });
  }
}

export async function createQuickBulkLead(req: Request, res: Response) {
  try {
    const { numbers = [], leadOwner } = req.body;

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
      message: "Unable to create quick leads.",
    });
  }
}

export async function getNewLeadsToday(req: Request, res: Response) {
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

export async function getNotifications(req: Request, res: Response) {
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
