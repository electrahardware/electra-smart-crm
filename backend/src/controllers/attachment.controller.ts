import { Request, Response } from "express";
import prisma from "../lib/prisma";
import { createTimeline } from "../services/timeline.service";

export async function uploadAttachment(
  req: Request,
  res: Response
) {
  try {

    if (!req.file) {
      return res.status(400).json({
        message: "No file uploaded.",
      });
    }

    const leadId =
      Number(req.params.leadId);

    const attachment =
      await prisma.leadAttachment.create({
        data: {
          leadId,
          fileName: req.file.filename,
          originalName: req.file.originalname,
          fileType: req.file.mimetype,
          fileSize: req.file.size,
          filePath: req.file.filename,
        },
      });

    await prisma.lead.update({
      where: { id: leadId },
      data: { lastEditedAt: new Date() },
    });

    await createTimeline({
      leadId,
      type: "ATTACHMENT",
      title: "Attachment Uploaded",
      description: attachment.originalName,
      createdBy: "System",
    });

    res.status(201).json(attachment);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Unable to upload attachment.",
    });

  }
}

export async function getAttachments(
  req: Request,
  res: Response
) {
  try {

    const files =
      await prisma.leadAttachment.findMany({
        where: {
          leadId: Number(req.params.leadId),
        },
        orderBy: {
          createdAt: "desc",
        },
      });

    res.json(files);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Unable to load attachments.",
    });

  }
}

export async function deleteAttachment(
  req: Request,
  res: Response
) {
  try {

    const attachment = await prisma.leadAttachment.findUnique({
      where: {
        id: Number(req.params.id),
      },
      select: {
        leadId: true,
      },
    });

    if (!attachment) {
      return res.status(404).json({
        message: "Attachment not found.",
      });
    }

    await prisma.leadAttachment.delete({
      where: {
        id: Number(req.params.id),
      },
    });

    await prisma.lead.update({
      where: { id: attachment.leadId },
      data: { lastEditedAt: new Date() },
    });

    res.json({
      success: true,
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Unable to delete attachment.",
    });

  }
}
