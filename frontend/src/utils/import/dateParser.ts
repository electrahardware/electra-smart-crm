import * as XLSX from "xlsx";

/**
 * Convert various Excel date formats into YYYY-MM-DD.
 */
export function parseExcelDate(value: unknown): string {
  if (value === null || value === undefined || value === "") {
    return "";
  }

  // Already a JS Date
  if (value instanceof Date) {
    return formatDate(value);
  }

  // Excel serial number
  if (typeof value === "number") {
    const parsed = XLSX.SSF.parse_date_code(value);

    if (!parsed) {
      return "";
    }

    return formatDate(new Date(parsed.y, parsed.m - 1, parsed.d));
  }

  const text = String(value).trim();

  if (!text) {
    return "";
  }

  // dd/mm/yyyy
  const slash = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);

  if (slash) {
    const [, d, m, y] = slash;

    return formatDate(new Date(Number(y), Number(m) - 1, Number(d)));
  }

  // dd-mm-yyyy
  const dashDMY = text.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);

  if (dashDMY) {
    const [, d, m, y] = dashDMY;

    return formatDate(new Date(Number(y), Number(m) - 1, Number(d)));
  }

  // yyyy-mm-dd
  const dash = text.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);

  if (dash) {
    return text;
  }

  // Browser Date parsing
  const parsedDate = new Date(text);

  if (!isNaN(parsedDate.getTime())) {
    return formatDate(parsedDate);
  }

  return "";
}

function formatDate(date: Date): string {
  const year = date.getFullYear();

  const month = String(date.getMonth() + 1).padStart(2, "0");

  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}
