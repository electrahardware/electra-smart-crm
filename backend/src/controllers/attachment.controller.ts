import { Request, Response } from "express";
import prisma from "../lib/prisma";

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

    const attachment =
      await prisma.leadAttachment.create({
        data: {
          leadId: Number(req.params.leadId),
          fileName: req.file.filename,
          originalName: req.file.originalname,
          fileType: req.file.mimetype,
          fileSize: req.file.size,
          filePath: req.file.path,
        },
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

    await prisma.leadAttachment.delete({
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
      message: "Unable to delete attachment.",
    });

  }
}