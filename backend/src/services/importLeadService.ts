import prisma from "../lib/prisma";
import { getListPriority } from "../utils/listPriority";

import type {
  DuplicatePolicy,
  ImportCommitResponse,
  ImportLeadRow,
  ImportPreviewResponse,
  ImportPreviewRow,
} from "../types/import";

type ImportUser = {
  name: string;
  role: string;
};

const VALID_OWNERS = [
  "Nirav Sir",
  "Harnish Bhai",
  "Dharmesh Bhai",
  "Dhiren Bhai",
];

function normalizeMobile(mobile?: string): string {
  if (!mobile) {
    return "";
  }

  let value = String(mobile).trim();

  // Keep only digits
  value = value.replace(/\D/g, "");

  // Remove India country code
  if (value.length === 12 && value.startsWith("91")) {
    value = value.substring(2);
  }

  // Remove leading zero
  if (value.length === 11 && value.startsWith("0")) {
    value = value.substring(1);
  }

  return value;
}

function validateLead(lead: ImportLeadRow): {
  status: ImportPreviewRow["status"];
  errors: ImportPreviewRow["errors"];
} {
  lead.mobile = normalizeMobile(lead.mobile);

  lead.secondaryMobile = normalizeMobile(lead.secondaryMobile);

  lead.whatsapp = normalizeMobile(lead.whatsapp || lead.mobile);

  const errors: ImportPreviewRow["errors"] = [];

  if (!lead.mobile || !/^\d{10}$/.test(lead.mobile)) {
    errors.push({
      field: "mobile",

      message: "Valid 10-digit mobile number is required.",
    });
  }

  const owner = (lead.leadOwner ?? "").trim();

  if (owner && !VALID_OWNERS.includes(owner)) {
    errors.push({
      field: "leadOwner",
      message: `Invalid Owner. Allowed: ${VALID_OWNERS.join(", ")}`,
    });
  }

  return {
    status: errors.length === 0 ? "ready" : "invalid",
    errors,
  };
}

export async function previewImportLeads(
  rows: ImportLeadRow[],
  user: ImportUser,
): Promise<ImportPreviewResponse> {
  for (const lead of rows) {
    const owner = (lead.leadOwner ?? "").trim();

    if (user.role === "Sales Executive") {
      lead.leadOwner = user.name;
    } else if (owner && VALID_OWNERS.includes(owner)) {
      lead.leadOwner = owner;
    } else {
      lead.leadOwner = user.name;
    }
  }

  const previewRows: ImportPreviewRow[] = rows.map((lead) => {
    const validation = validateLead(lead);

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

    const contactNumbers = [row.lead.mobile, row.lead.secondaryMobile, row.lead.whatsapp]
      .filter((number): number is string => Boolean(number));

    if (contactNumbers.some((number) => seen.has(number))) {
      row.status = "duplicate";

      row.errors.push({
        field: "mobile",
        message: "Duplicate mobile found in Excel.",
      });

      return;
    }

    contactNumbers.forEach((number) => seen.add(number));
  });

  const contactNumbers = previewRows
    .filter((row) => row.status === "ready")
    .flatMap((row) => [row.lead.mobile, row.lead.secondaryMobile, row.lead.whatsapp])
    .filter((number): number is string => Boolean(number));

  const existingLeads = await prisma.lead.findMany({
    where: {
      OR: [
        { mobile: { in: contactNumbers } },
        { secondaryMobile: { in: contactNumbers } },
        { whatsapp: { in: contactNumbers } },
      ],
    },
    select: {
      id: true,
      mobile: true,
      secondaryMobile: true,
      whatsapp: true,
    },
  });

  const existingMap = new Map<string, number>();
  existingLeads.forEach((lead) => {
    [lead.mobile, lead.secondaryMobile, lead.whatsapp]
      .filter((number): number is string => Boolean(number))
      .forEach((number) => existingMap.set(number, lead.id));
  });

  previewRows.forEach((row) => {
    if (row.status !== "ready") {
      return;
    }

    const id = [row.lead.mobile, row.lead.secondaryMobile, row.lead.whatsapp]
      .filter((number): number is string => Boolean(number))
      .map((number) => existingMap.get(number))
      .find(Boolean);

    if (!id) {
      return;
    }

    row.status = "duplicate";

    row.existingLeadId = id;

    row.errors.push({
      field: "mobile",
      message: "Mobile already exists in CRM.",
    });
  });
  const readyRows = previewRows.filter((row) => row.status === "ready").length;

  const duplicateRows = previewRows.filter(
    (row) => row.status === "duplicate",
  ).length;

  const invalidRows = previewRows.filter(
    (row) => row.status === "invalid",
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
  duplicatePolicy: DuplicatePolicy,
  user: ImportUser,
): Promise<ImportCommitResponse> {
  let insertedRows = 0;
  let updatedRows = 0;
  let skippedRows = 0;
  let failedRows = 0;

  for (const lead of rows) {
    const owner = (lead.leadOwner ?? "").trim();

    if (user.role === "Sales Executive") {
      lead.leadOwner = user.name;
    } else if (owner && VALID_OWNERS.includes(owner)) {
      lead.leadOwner = owner;
    } else {
      lead.leadOwner = user.name;
    }

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
            customerName: lead.customerName?.trim() || "",
            lastEditedAt: new Date(),
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

            leadDate: lead.leadDate ? new Date(lead.leadDate) : new Date(),
            addressLine1: lead.addressLine1,
            addressLine2: lead.addressLine2,
            leadOwner: lead.leadOwner,
            leadSource: lead.leadSource,
            language: lead.language,
            status: lead.status,
            listPriority: getListPriority(lead.status),
            followupDate: null,

            followupCompleted: false,

            followupCompletedAt: null,
            notes: lead.notes,
          },
        });

        if (lead.notes && lead.notes.trim() !== "") {
          await prisma.leadNote.create({
            data: {
              leadId: existing.id,
              note: lead.notes,
              createdBy: user.name,
            },
          });
        }

        await prisma.leadTimeline.create({
          data: {
            leadId: existing.id,

            type: "IMPORT",

            title: "Lead Updated via Import",

            description: `Lead updated from Excel and assigned to ${lead.leadOwner} by ${user.name}`,

            createdBy: user.name,
          },
        });

        updatedRows++;
        continue;
      }

      const newLead = await prisma.lead.create({
        data: {
          customerName: lead.customerName?.trim() || "",
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

          leadDate: lead.leadDate ? new Date(lead.leadDate) : new Date(),
          addressLine1: lead.addressLine1,
          addressLine2: lead.addressLine2,
          leadOwner: lead.leadOwner,
          leadSource: lead.leadSource,
          language: lead.language,
          status: lead.status || "None",
          listPriority: getListPriority(lead.status || "None"),
          followupDate: null,

          followupCompleted: false,

          followupCompletedAt: null,
          notes: lead.notes,
        },
      });

      if (lead.notes && lead.notes.trim() !== "") {
        await prisma.leadNote.create({
          data: {
            leadId: newLead.id,
            note: lead.notes,
            createdBy: user.name,
          },
        });
      }

      await prisma.leadTimeline.create({
        data: {
          leadId: newLead.id,

          type: "IMPORT",

          title: "Lead Imported",

          description: `Lead imported from Excel by ${user.name} and assigned to ${lead.leadOwner}`,

          createdBy: user.name,
        },
      });

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
