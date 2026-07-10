import { Request, Response } from "express";
import prisma from "../lib/prisma";

export async function getDuplicates(
  req: Request,
  res: Response
) {

  try {

    const leads =
      await prisma.lead.findMany({
        orderBy: {
          customerName: "asc",
        },
      });

    const duplicates =
      leads.filter(
        (lead, index, array) =>

          array.findIndex(
            (item) =>
              item.mobile ===
              lead.mobile
          ) !== index
      );

    res.json(duplicates);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message:
        "Unable to load duplicates.",
    });

  }

}