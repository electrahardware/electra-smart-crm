import type {
  ImportLeadRow,
  ImportPreviewResponse,
} from "../types/import";
import prisma from "../lib/prisma";
interface PreviewRow {
  rowNumber: number;
  status: "ready" | "invalid";
  lead: ImportLeadRow;
  errors: { message: string }[];
  existingLeadId?: number;
}

export async function previewImportLeads(
  rows: ImportLeadRow[]
): Promise<ImportPreviewResponse> {
  const previewRows: PreviewRow[] = rows.map((lead) => {
  const errors: { message: string }[] = [];

  if (!lead.customerName.trim()) {
    errors.push({
      message: "Customer name is required.",
    });
  }

  if (!lead.mobile.trim()) {
    errors.push({
      message: "Mobile number is required.",
    });
  }

  return {
    rowNumber: lead.rowNumber,
    status: errors.length === 0 ? "ready" : "invalid",
    lead,
    errors,
  };
});

const readyRows = previewRows.filter(
  (row) => row.status === "ready"
);

const invalidRows = previewRows.filter(
  (row) => row.status === "invalid"
);
const seenMobiles = new Set<string>();

previewRows.forEach((row) => {
  if (row.status === "invalid") {
    return;
  }

  if (seenMobiles.has(row.lead.mobile)) {
    row.status = "invalid";

    row.errors.push({
      message: "Duplicate mobile found in Excel.",
    });

    return;
  }

  seenMobiles.add(row.lead.mobile);
});

const mobilesToCheck = previewRows
  .filter((row) => row.status === "ready")
  .map((row) => row.lead.mobile);

const existingLeads = await prisma.lead.findMany({
  where: {
    mobile: {
      in: mobilesToCheck,
    },
  },
  select: {
    id: true,
    mobile: true,
  },
});

const existingMobileMap = new Map(
  existingLeads.map((lead) => [lead.mobile, lead.id])
);

previewRows.forEach((row) => {
  if (row.status === "invalid") {
    return;
  }

  const existingLeadId = existingMobileMap.get(row.lead.mobile);

  if (existingLeadId) {
    row.status = "invalid";

    row.existingLeadId = existingLeadId;

    row.errors.push({
      message: "Mobile number already exists in CRM.",
    });
  }
});

return {
  summary: {
    totalRows: rows.length,
    readyRows: readyRows.length,
   duplicateRows: previewRows.filter((row) =>
  row.errors.some(
    (error) =>
      error.message === "Duplicate mobile found in Excel." ||
      error.message === "Mobile number already exists in CRM."
  )
).length,
    invalidRows: invalidRows.length,
    skippedRows: invalidRows.length,
  },

  rows: previewRows,
};
}