import type {
  DuplicatePolicy,
  ImportCommitResponse,
  ImportLeadRow,
  ImportPreviewResponse,
} from "../types/import";

const BASE_URL = "http://localhost:5000/api/import";

async function request<T>(
  url: string,
  body: unknown
): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(
      `Request failed (${response.status})`
    );
  }

  return response.json() as Promise<T>;
}
export async function previewLeadImport(
  rows: ImportLeadRow[]
): Promise<ImportPreviewResponse> {
  return request<ImportPreviewResponse>(
    `${BASE_URL}/leads/preview`,
    {
      rows,
    }
  );
}
export async function commitLeadImport(
  rows: ImportLeadRow[],
  duplicatePolicy: DuplicatePolicy
): Promise<ImportCommitResponse> {
  return request<ImportCommitResponse>(
    `${BASE_URL}/leads/commit`,
    {
      rows,
      duplicatePolicy,
    }
  );
}