import * as XLSX from "xlsx";
import type { Lead } from "../types/lead";
import { IMPORT_EXPORT_COLUMNS } from "../constants/importExportColumns";

function formatDate(value?: string | null) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}-${month}-${year}`;
}

function getLeadValue(
  lead: Lead,
  key: string
) {
  switch (key) {
    case "leadDate":
      return formatDate(lead.leadDate);

    case "followupDate":
      return formatDate(lead.followupDate);

    case "note1":
    case "note2":
    case "note3":
    case "note4":
    case "note5": {
      const notes =
        lead.notes
          ?.split("\n")
          .filter(Boolean) ?? [];

      return notes[
        Number(key.replace("note", "")) - 1
      ] ?? "";
    }

    default:
      return (lead as any)[key] ?? "";
  }
}

export function exportLeadsExcel(
  leads: Lead[]
) {
  const rows = leads.map((lead) => {
    const row: Record<string, unknown> = {};

    IMPORT_EXPORT_COLUMNS.forEach(
      (column) => {
        row[column.header] =
          getLeadValue(
            lead,
            column.key
          );
      }
    );

    return row;
  });

  const worksheet =
    XLSX.utils.json_to_sheet(rows);

  worksheet["!cols"] =
    IMPORT_EXPORT_COLUMNS.map(() => ({
      wch: 22,
    }));

  const workbook =
    XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    "Leads"
  );

  const now = new Date();

  const fileName =
    `Leads_${now.getFullYear()}-${String(
      now.getMonth() + 1
    ).padStart(2, "0")}-${String(
      now.getDate()
    ).padStart(2, "0")}_${String(
      now.getHours()
    ).padStart(2, "0")}-${String(
      now.getMinutes()
    ).padStart(2, "0")}.xlsx`;

  XLSX.writeFile(
    workbook,
    fileName
  );
}