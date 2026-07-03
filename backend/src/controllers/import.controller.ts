import { Request, Response } from "express";

export async function previewLeadImport(
  req: Request,
  res: Response
) {
  return res.status(501).json({
    success: false,
    message: "Import preview is not implemented yet.",
  });
}

export async function commitLeadImport(
  req: Request,
  res: Response
) {
  return res.status(501).json({
    success: false,
    message: "Import commit is not implemented yet.",
  });
}