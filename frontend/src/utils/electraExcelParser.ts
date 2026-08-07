import * as XLSX from "xlsx";

import type { ImportLeadRow } from "../types/import";

import { detectColumns, type CanonicalColumn } from "./import/headerMapper";

import { parseExcelDate } from "./import/dateParser";
import { splitMobileNumbers } from "./import/mobileParser";

export interface ParseElectraExcelResult {
  rows: ImportLeadRow[];
  detectedColumns: Partial<Record<CanonicalColumn, string>>;
  totalRows: number;
}

const MAX_ROWS = 10000;

type CellValue = string | number | boolean | Date | null | undefined;

function cellToString(value: CellValue): string {
  if (value === null || value === undefined) {
    return "";
  }

  if (value instanceof Date) {
    return parseExcelDate(value);
  }

  return String(value).trim();
}

function isBlankRow(row: CellValue[]): boolean {
  return row.every((cell) => cellToString(cell) === "");
}

function getCell(
  row: CellValue[],
  indexes: Partial<Record<CanonicalColumn, number>>,
  field: CanonicalColumn,
): CellValue {
  const index = indexes[field];

  if (index === undefined) {
    return "";
  }

  return row[index];
}

function getCellText(
  row: CellValue[],
  indexes: Partial<Record<CanonicalColumn, number>>,
  field: CanonicalColumn,
): string {
  return cellToString(getCell(row, indexes, field));
}

export async function parseElectraExcel(
  file: File,
): Promise<ParseElectraExcelResult> {
  const buffer = await file.arrayBuffer();

  const workbook = XLSX.read(buffer, {
    type: "array",
    // Keep Excel dates as raw serial values so parseExcelDate can apply DMY rules.
    cellDates: false,
  });

  const firstSheet = workbook.SheetNames[0];

  if (!firstSheet) {
    return {
      rows: [],
      detectedColumns: {},
      totalRows: 0,
    };
  }

  const worksheet = workbook.Sheets[firstSheet];

  const sheetRows = XLSX.utils.sheet_to_json<CellValue[]>(worksheet, {
    header: 1,
    raw: true,
    defval: "",
  });

  const headers = (sheetRows[0] ?? []).map(cellToString);

  const dataRows = sheetRows.slice(1).filter((row) => !isBlankRow(row));

  function getHeaderIndex(headerName: string): number {
    return headers.findIndex(
      (header) =>
        header.trim().toLowerCase() === headerName.trim().toLowerCase(),
    );
  }

  const noteIndexes: number[] = [];

  for (let i = 1; i <= 20; i++) {
    const index = getHeaderIndex(`Notes ${i}`);

    if (index !== -1) {
      noteIndexes.push(index);
    }
  }

  if (dataRows.length > MAX_ROWS) {
    throw new Error("Excel file cannot contain more than 10000 rows.");
  }

  const { detectedColumns, columnIndexes } = detectColumns(headers);

  console.log("HEADERS =", headers);

  console.log("DETECTED =", detectedColumns);

  console.log("INDEXES =", columnIndexes);

  const rows: ImportLeadRow[] = dataRows.map((row, index) => {
    const mobileNumbers = splitMobileNumbers(
      getCellText(row, columnIndexes, "mobile"),
    );

    const whatsappNumbers = splitMobileNumbers(
      getCellText(row, columnIndexes, "whatsapp"),
    );

    const contactNumbers = [
      mobileNumbers.primaryMobile,
      mobileNumbers.secondaryMobile,
      whatsappNumbers.primaryMobile,
      whatsappNumbers.secondaryMobile,
    ].filter((number): number is string => Boolean(number));

    const uniqueContactNumbers = [...new Set(contactNumbers)];

    const notes = noteIndexes
      .map((index) => cellToString(row[index]))
      .filter(Boolean)
      .join("\n");

    const city = getCellText(row, columnIndexes, "city");

    console.log("CITY =", city);

    const rawLeadDate = getCell(row, columnIndexes, "leadDate");

    console.log("RAW LEAD DATE =", rawLeadDate);

    const parsedLeadDate = parseExcelDate(rawLeadDate);

    console.log("PARSED LEAD DATE =", parsedLeadDate);

    return {
      rowNumber: index + 2,

      customerName:
        getCellText(row, columnIndexes, "customerName") ||
        getCellText(row, columnIndexes, "shopName"),

      mobile: uniqueContactNumbers[0] ?? "",

      secondaryMobile: uniqueContactNumbers[1] ?? undefined,

      whatsapp: whatsappNumbers.primaryMobile ?? uniqueContactNumbers[0] ?? undefined,

      shopName: getCellText(row, columnIndexes, "shopName"),

      customerType: "",

      email: getCellText(row, columnIndexes, "email"),

      gst: getCellText(row, columnIndexes, "gst"),

      country: "India",

      state: getCellText(row, columnIndexes, "state"),

      district: getCellText(row, columnIndexes, "district"),

      city,

      area:
        getCellText(row, columnIndexes, "area") ||
        getCellText(row, columnIndexes, "district"),

      pincode: getCellText(row, columnIndexes, "pincode"),

      addressLine1: getCellText(row, columnIndexes, "address"),

      addressLine2: "",

      leadOwner: getCellText(row, columnIndexes, "leadOwner"),

      leadSource: getCellText(row, columnIndexes, "leadSource"),

      language: "Gujarati",


      status: getCellText(row, columnIndexes, "status"),

      expectedValue: undefined,

      probability: undefined,

      leadDate: parsedLeadDate,

      followupDate: parseExcelDate(getCell(row, columnIndexes, "followupDate")),

      followupTime: "",

      notes,
    };
  });

  return {
    rows,
    detectedColumns,
    totalRows: dataRows.length,
  };
}
