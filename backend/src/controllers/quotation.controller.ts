import { Response } from "express";
import prisma from "../lib/prisma";
import { AuthRequest, isLeadPrivileged, requireLeadAccess } from "../middleware/auth.middleware";

export async function getQuotations(
  req: AuthRequest,
  res: Response
) {
  try {

    const where = isLeadPrivileged(req.user?.role)
      ? {}
      : { lead: { leadOwner: req.user!.name } };

    const quotations =
      await prisma.quotation.findMany({
        where,
        include: {
          items: true,
          lead: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

    res.json(quotations);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message:
        "Unable to load quotations.",
    });

  }
}

export async function getQuotation(
  req: AuthRequest,
  res: Response
) {
  try {

    const quotation =
      await prisma.quotation.findUnique({
        where: {
          id: Number(req.params.id),
        },
        include: {
          items: true,
          lead: true,
        },
      });

    if (!quotation) {
      return res.status(404).json({ message: "Quotation not found." });
    }

    if (!(await requireLeadAccess(req, res, quotation.leadId))) {
      return;
    }

    res.json(quotation);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message:
        "Unable to load quotation.",
    });

  }
}

export async function createQuotation(
  req: AuthRequest,
  res: Response
) {
  try {

    const leadId = Number(req.body.leadId);

    if (!(await requireLeadAccess(req, res, leadId))) {
      return;
    }

    const quotation =
      await prisma.quotation.create({
        data: req.body,
        include: {
          items: true,
        },
      });

    res.status(201).json(
      quotation
    );

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message:
        "Unable to create quotation.",
    });

  }
}

export async function updateQuotation(
  req: AuthRequest,
  res: Response
) {
  try {

    const existing = await prisma.quotation.findUnique({
      where: { id: Number(req.params.id) },
      select: { leadId: true },
    });

    if (!existing) {
      return res.status(404).json({ message: "Quotation not found." });
    }

    if (!(await requireLeadAccess(req, res, existing.leadId))) {
      return;
    }

    const quotation =
      await prisma.quotation.update({
        where: {
          id: Number(req.params.id),
        },
        data: req.body,
      });

    res.json(quotation);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message:
        "Unable to update quotation.",
    });

  }
}

export async function deleteQuotation(
  req: AuthRequest,
  res: Response
) {
  try {

    const existing = await prisma.quotation.findUnique({
      where: { id: Number(req.params.id) },
      select: { leadId: true },
    });

    if (!existing) {
      return res.status(404).json({ message: "Quotation not found." });
    }

    if (!(await requireLeadAccess(req, res, existing.leadId))) {
      return;
    }

    await prisma.quotation.delete({
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
      message:
        "Unable to delete quotation.",
    });

  }
}
