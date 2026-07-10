import { Request, Response } from "express";
import prisma from "../lib/prisma";

export async function getQuotations(
  req: Request,
  res: Response
) {
  try {

    const quotations =
      await prisma.quotation.findMany({
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
  req: Request,
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
  req: Request,
  res: Response
) {
  try {

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
  req: Request,
  res: Response
) {
  try {

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
  req: Request,
  res: Response
) {
  try {

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