import { Request, Response } from "express";
import {
  previewImportLeads,
  commitImportLeads,
} from "../services/importLeadService";

export async function previewLeadImport(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { rows } = req.body;

    const result = await previewImportLeads(rows ?? []);

    res.status(200).json(result);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Unable to generate import preview.",
    });
  }
}

export async function commitLeadImport(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { rows, duplicatePolicy } = req.body;

    const result = await commitImportLeads(
      rows ?? [],
      duplicatePolicy
    );

    res.status(200).json(result);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Unable to import leads.",
    });
  }
}
