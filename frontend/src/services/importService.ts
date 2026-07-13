import { api } from "../lib/api";

import type {
  DuplicatePolicy,
  ImportCommitResponse,
  ImportLeadRow,
  ImportPreviewResponse,
} from "../types/import";

export async function previewLeadImport(
  rows: ImportLeadRow[]
): Promise<ImportPreviewResponse> {
  return api<ImportPreviewResponse>(
    "/import/leads/preview",
    {
      method: "POST",
      body: JSON.stringify({
        rows,
      }),
    }
  );
}

export async function commitLeadImport(
  rows: ImportLeadRow[],
  duplicatePolicy: DuplicatePolicy
): Promise<ImportCommitResponse> {
  return api<ImportCommitResponse>(
    "/import/leads/commit",
    {
      method: "POST",
      body: JSON.stringify({
        rows,
        duplicatePolicy,
      }),
    }
  );
}