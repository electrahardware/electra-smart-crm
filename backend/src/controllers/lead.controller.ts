import { Request, Response } from "express";
import prisma from "../lib/prisma";

export const getAllLeads = async (req: Request, res: Response) => {
  try {
    const leads = await prisma.lead.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(leads);
  } catch (e) {
    console.error(e);

    res.status(500).json({
      message: "Unable to fetch leads",
    });
  }
};

export const getLead = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    const lead = await prisma.lead.findUnique({
      where: {
        id,
      },
    });

    if (!lead) {
      return res.status(404).json({
        message: "Lead not found",
      });
    }

    res.json(lead);
  } catch (e) {
    res.status(500).json({
      message: "Error",
    });
  }
};

export const createLead = async (req: Request, res: Response) => {
  try {
    console.log("BODY =", req.body);
    const existingLead = await prisma.lead.findFirst({
  where: {
    mobile: req.body.mobile,
  },
});

if (existingLead) {
  return res.status(409).json({
    message: "Duplicate Mobile Number",
    lead: existingLead,
  });
}
    const lead = await prisma.lead.create({
  data: {
    ...req.body,

    products: Array.isArray(req.body.products)
      ? req.body.products.join(", ")
      : req.body.products,

      expectedValue:
  req.body.expectedValue !== ""
    ? Number(req.body.expectedValue)
    : null,

probability:
  req.body.probability !== ""
    ? Number(req.body.probability)
    : null,

    followupDate:
      req.body.followupDate && req.body.followupDate !== ""
        ? new Date(req.body.followupDate)
        : null,
  },
});

    res.status(201).json(lead);
  } catch (e) {
    console.error(e);

    res.status(500).json({
      message: "Unable to create lead",
    });
  }
};

export const updateLead = async (
  req: Request,
  res: Response
) => {
  try {

    const id = Number(req.params.id);

    console.log("UPDATE ID =", id);
    console.log("UPDATE BODY =", req.body);

    const lead = await prisma.lead.update({

      where: {
        id,
      },

      data: {

        ...req.body,

        products: Array.isArray(req.body.products)
          ? req.body.products.join(", ")
          : req.body.products,

          expectedValue:
  req.body.expectedValue !== ""
    ? Number(req.body.expectedValue)
    : null,

probability:
  req.body.probability !== ""
    ? Number(req.body.probability)
    : null,

        followupDate:
          req.body.followupDate &&
          req.body.followupDate !== ""
            ? new Date(req.body.followupDate)
            : null,

      },

    });

    res.json(lead);

  } catch (e) {

    console.error(e);

    res.status(500).json({
      message: "Unable to update",
    });

  }
};

export const deleteLead = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    await prisma.lead.delete({
      where: {
        id,
      },
    });

    res.json({
      success: true,
    });
  } catch (e) {
    res.status(500).json({
      message: "Unable to delete",
    });
  }
};