import path from "path";
import { Response } from "express";
import prisma from "../lib/prisma";
import { createTimeline } from "../services/timeline.service";
import { AuthRequest, requireLeadAccess } from "../middleware/auth.middleware";

export async function uploadAttachment(
  req: AuthRequest,
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

    if (!(await requireLeadAccess(req, res, leadId))) {
      return;
    }

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
      data: { lastEditedAt: new Date(), lastEditedBy: req.user!.name },
    });

    await createTimeline({
      leadId,
      type: "ATTACHMENT",
      title: "Attachment Uploaded",
      description: attachment.originalName,
      createdBy: req.user!.name,
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
  req: AuthRequest,
  res: Response
) {
  try {

    const leadId = Number(req.params.leadId);

    if (!(await requireLeadAccess(req, res, leadId))) {
      return;
    }

    const files =
      await prisma.leadAttachment.findMany({
        where: {
          leadId,
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
  req: AuthRequest,
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

    if (!(await requireLeadAccess(req, res, attachment.leadId))) {
      return;
    }

    await prisma.leadAttachment.delete({
      where: {
        id: Number(req.params.id),
      },
    });

    await prisma.lead.update({
      where: { id: attachment.leadId },
      data: { lastEditedAt: new Date(), lastEditedBy: req.user!.name },
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

export async function downloadAttachment(req: AuthRequest, res: Response) {
  try {
    const attachmentId = Number(req.params.id);
    const attachment = await prisma.leadAttachment.findUnique({
      where: { id: attachmentId },
    });

    if (!attachment) {
      return res.status(404).json({ message: "Attachment not found." });
    }

    if (!(await requireLeadAccess(req, res, attachment.leadId))) {
      return;
    }

    const uploadsDirectory = path.resolve(process.cwd(), "uploads");
    const resolvedPath = path.resolve(uploadsDirectory, attachment.filePath);

    if (!resolvedPath.startsWith(`${uploadsDirectory}${path.sep}`)) {
      return res.status(400).json({ message: "Invalid attachment path." });
    }

    return res.download(resolvedPath, attachment.originalName);
  } catch (error) {
    console.error("Unable to download attachment:", error);
    return res.status(500).json({ message: "Unable to download attachment." });
  }
}
