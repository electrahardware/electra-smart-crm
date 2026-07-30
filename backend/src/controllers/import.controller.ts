import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import {
  commitImportLeads,
  previewImportLeads,
} from "../services/importLeadService";

export async function previewLeadImport(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  try {
    const { rows } = req.body;

    const result = await previewImportLeads(rows ?? [], req.user!);

    res.status(200).json(result);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Unable to generate import preview.",
    });
  }
}

export async function commitLeadImport(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  try {
    const { rows, duplicatePolicy } = req.body;

    const result = await commitImportLeads(
      rows ?? [],
      duplicatePolicy,
      req.user!,
    );

    res.status(200).json(result);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Unable to import leads.",
    });
  }
}
