import prisma from "../lib/prisma";

import type {
  DuplicatePolicy,
  ImportCommitResponse,
  ImportLeadRow,
  ImportPreviewResponse,
  ImportPreviewRow,
} from "../types/import";

function normalizeMobile(
  mobile?: string
): string {

  if (!mobile) {
    return "";
  }

  let value = String(mobile).trim();

  // Keep only digits
  value = value.replace(/\D/g, "");

  // Remove India country code
  if (
    value.length === 12 &&
    value.startsWith("91")
  ) {
    value = value.substring(2);
  }

  // Remove leading zero
  if (
    value.length === 11 &&
    value.startsWith("0")
  ) {
    value = value.substring(1);
  }

  return value;
}

function validateLead(
  lead: ImportLeadRow
): {
  status: ImportPreviewRow["status"];
  errors: ImportPreviewRow["errors"];
} {

  lead.mobile =
  normalizeMobile(lead.mobile);

lead.whatsapp =
  normalizeMobile(
    lead.whatsapp || lead.mobile
  );

  const errors: ImportPreviewRow["errors"] = [];

  if (
  !lead.mobile ||
  !/^\d{10}$/.test(lead.mobile)
) {

  errors.push({

    field: "mobile",

    message:
      "Valid 10-digit mobile number is required.",

  });

}

  return {
    status:
      errors.length === 0
        ? "ready"
        : "invalid",
    errors,
  };
}

export async function previewImportLeads(
  rows: ImportLeadRow[]
): Promise<ImportPreviewResponse> {
  const previewRows: ImportPreviewRow[] =
    rows.map((lead) => {
      const validation =
        validateLead(lead);

      return {
        rowNumber: lead.rowNumber,
        lead,
        status: validation.status,
        errors: validation.errors,
      };
    });

  const seen = new Set<string>();

  previewRows.forEach((row) => {
    if (row.status !== "ready") {
      return;
    }

    if (seen.has(row.lead.mobile)) {
      row.status = "duplicate";

      row.errors.push({
        field: "mobile",
        message:
          "Duplicate mobile found in Excel.",
      });

      return;
    }

    seen.add(row.lead.mobile);
  });

  const mobiles = previewRows
    .filter(
      (row) => row.status === "ready"
    )
    .map((row) => row.lead.mobile);

  const existingLeads =
    await prisma.lead.findMany({
      where: {
        mobile: {
          in: mobiles,
        },
      },
      select: {
        id: true,
        mobile: true,
      },
    });

  const existingMap = new Map(
    existingLeads.map((lead) => [
      lead.mobile,
      lead.id,
    ])
  );

  previewRows.forEach((row) => {
    if (row.status !== "ready") {
      return;
    }

    const id = existingMap.get(
      row.lead.mobile
    );

    if (!id) {
      return;
    }

    row.status = "duplicate";

    row.existingLeadId = id;

    row.errors.push({
      field: "mobile",
      message:
        "Mobile already exists in CRM.",
    });
  });
    const readyRows = previewRows.filter(
    (row) => row.status === "ready"
  ).length;

  const duplicateRows = previewRows.filter(
    (row) => row.status === "duplicate"
  ).length;

  const invalidRows = previewRows.filter(
    (row) => row.status === "invalid"
  ).length;

  return {
    summary: {
      totalRows: previewRows.length,
      readyRows,
      duplicateRows,
      invalidRows,
      skippedRows: 0,
    },
    rows: previewRows,
  };
}

export async function commitImportLeads(
  rows: ImportLeadRow[],
  duplicatePolicy: DuplicatePolicy
): Promise<ImportCommitResponse> {
  let insertedRows = 0;
  let updatedRows = 0;
  let skippedRows = 0;
  let failedRows = 0;

  for (const lead of rows) {
    try {
      const existing = await prisma.lead.findFirst({
        where: {
          mobile: lead.mobile,
        },
      });

      if (existing) {
        if (duplicatePolicy === "skip_existing") {
          skippedRows++;
          continue;
        }

        await prisma.lead.update({
          where: {
            id: existing.id,
          },
          data: {
            customerName:
  lead.customerName?.trim() || "",
            secondaryMobile: lead.secondaryMobile,
            whatsapp: lead.whatsapp,
            shopName: lead.shopName,
            email: lead.email,
            gst: lead.gst,
            state: lead.state,
            district: lead.district,
            city: lead.city,
area: lead.area,
pincode: lead.pincode,

leadDate: lead.leadDate
  ? new Date(lead.leadDate)
  : new Date(),
            addressLine1: lead.addressLine1,
            addressLine2: lead.addressLine2,
            leadOwner: lead.leadOwner,
            leadSource: lead.leadSource,
            language: lead.language,
            priority: lead.priority,
            status: lead.status,
            followupDate: null,

followupCompleted: false,

followupCompletedAt: null,
            notes: lead.notes,
          },
        });

        if (
  lead.notes &&
  lead.notes.trim() !== ""
) {

  await prisma.leadNote.create({
    data: {
      leadId: existing.id,
      note: lead.notes,
    },
  });

}

        updatedRows++;
        continue;
      }

      const newLead =
  await prisma.lead.create({
    data: {
      customerName:
  lead.customerName?.trim() || "",
      mobile: lead.mobile,
      secondaryMobile: lead.secondaryMobile,
      whatsapp: lead.whatsapp,
      shopName: lead.shopName,
      email: lead.email,
      gst: lead.gst,
      state: lead.state,
      district: lead.district,
      city: lead.city,
area: lead.area,
pincode: lead.pincode,

leadDate: lead.leadDate
  ? new Date(lead.leadDate)
  : new Date(),
      addressLine1: lead.addressLine1,
      addressLine2: lead.addressLine2,
      leadOwner: lead.leadOwner,
      leadSource: lead.leadSource,
      language: lead.language,
      priority: lead.priority,
      status: lead.status,
      followupDate: null,

followupCompleted: false,

followupCompletedAt: null,
      notes: lead.notes,
    },
  });

if (
  lead.notes &&
  lead.notes.trim() !== ""
) {

  await prisma.leadNote.create({
    data: {
      leadId: newLead.id,
      note: lead.notes,
    },
  });

}
      insertedRows++;
    } catch (error) {
      console.error(error);
      failedRows++;
    }
  }

  return {
    insertedRows,
    updatedRows,
    duplicateRows: skippedRows,
    skippedRows,
    failedRows,
  };
}