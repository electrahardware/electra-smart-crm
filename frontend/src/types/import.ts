export type ImportRowStatus =
  | "ready"
  | "duplicate"
  | "invalid"
  | "skipped";

export type DuplicatePolicy =
  | "skip_existing"
  | "update_existing";

export interface ImportLeadRow {
  rowNumber: number;

  customerName: string;
  mobile: string;

  secondaryMobile?: string;
  whatsapp?: string;

  shopName: string;
  customerType: string;

  email?: string;
  gst?: string;

  country: string;
  state: string;
  district: string;
city: string;
area: string;
pincode: string;

leadDate: string;
  addressLine1: string;
  addressLine2: string;

  leadOwner: string;
  leadSource: string;
  language: string;

  status: string;

  expectedValue?: number;
  probability?: number;

  followupDate?: string;
  followupTime?: string;

  notes?: string;
}

export interface ImportValidationError {
  field?: keyof ImportLeadRow | "row";
  message: string;
}

export interface ImportPreviewRow {
  rowNumber: number;
  status: ImportRowStatus;
  lead: ImportLeadRow;
  errors: ImportValidationError[];
  existingLeadId?: number;
}

export interface ImportSummary {
  totalRows: number;
  readyRows: number;
  duplicateRows: number;
  invalidRows: number;
  skippedRows: number;
}

export interface ImportPreviewRequest {
  rows: ImportLeadRow[];
}

export interface ImportPreviewResponse {
  summary: ImportSummary;
  rows: ImportPreviewRow[];
}

export interface ImportCommitRequest {
  rows: ImportLeadRow[];
  duplicatePolicy: DuplicatePolicy;
}

export interface ImportCommitResponse {
  insertedRows: number;
  updatedRows: number;
  skippedRows: number;
  failedRows: number;
}
