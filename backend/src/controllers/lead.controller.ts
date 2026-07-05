import { Request, Response } from "express";
import prisma from "../lib/prisma";

export async function getAllLeads(
  req: Request,
  res: Response
) {
  try {
    const leads = await prisma.lead.findMany({
      orderBy: {
        id: "desc",
      },
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
    const lead = await prisma.lead.findUnique({
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
    const lead = await prisma.lead.create({
      data: req.body,
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
    const lead = await prisma.lead.update({
      where: {
        id: Number(req.params.id),
      },
      data: req.body,
    });

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
    const notes = await prisma.leadNote.findMany({
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
    const note = await prisma.leadNote.create({
      data: {
        leadId: Number(req.params.id),
        note: req.body.note,
      },
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