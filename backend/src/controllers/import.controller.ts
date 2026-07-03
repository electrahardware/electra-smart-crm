import { Request, Response } from "express";
import { previewImportLeads } from "../services/importLeadService";

export async function previewLeadImport(
  req: Request,
  res: Response
): Promise<void> {
  const { rows } = req.body;

const result = await previewImportLeads(rows ?? []);

res.status(200).json(result);
}

export async function commitLeadImport(
  req: Request,
  res: Response
): Promise<void> {
  res.status(501).json({
    message: "Lead import is not implemented yet.",
  });
}