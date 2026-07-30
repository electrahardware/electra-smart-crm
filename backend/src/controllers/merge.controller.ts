import { Request, Response } from "express";

export async function mergeLead(req: Request, res: Response) {
  try {
    const keepId = Number(req.body.keepId);

    const removeId = Number(req.body.removeId);

    if (!keepId || !removeId) {
      return res.status(400).json({
        message: "Invalid lead ids.",
      });
    }

    if (keepId === removeId) {
      return res.status(400).json({
        message: "Both leads cannot be same.",
      });
    }

    res.json({
      success: true,
      message: "Merge API ready.",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Unable to merge.",
    });
  }
}
