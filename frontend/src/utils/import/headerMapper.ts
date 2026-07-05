export type CanonicalColumn =
  | "customerName"
  | "shopName"
  | "mobile"
  | "whatsapp"
  | "email"
  | "gst"
  | "address"
  | "area"
  | "district"
  | "state"
  | "pincode"
  | "leadOwner"
  | "leadSource"
  | "priority"
  | "status"
  | "followupDate"
  | "notes";

export const HEADER_SYNONYMS: Record<
  CanonicalColumn,
  string[]
> = {
  customerName: [
  "Customer Name",
  "Customer",
  "Name",
  "Party Name",
  "Dealer Name",
  "Shop / Company Name",
],

  shopName: [
  "Shop Name",
  "Firm Name",
  "Company Name",
  "Business Name",
  "Shop / Company Name",
],

  mobile: [
  "Mobile",
  "Mobile No",
  "Mobile Number",
  "Phone",
  "Phone Number",
  "Contact",
  "Contact No",
  "Contact Number",
  "Whatsapp Number",
  "WhatsApp Number",
],

  whatsapp: [
  "Whatsapp",
  "WhatsApp",
  "WhatsApp No",
  "WhatsApp Number",
  "Whatsapp Number",
],

  email: [
    "Email",
    "Email ID",
    "Mail",
  ],

  gst: [
    "GST",
    "GSTIN",
    "GST No",
    "GST Number",
  ],

  address: [
    "Address",
    "Address 1",
    "Full Address",
  ],

  area: [
    "Area",
    "Locality",
  ],

  district: [
    "District",
    "City",
  ],

  state: [
    "State",
  ],

  pincode: [
    "Pincode",
    "Pin",
    "Zip",
    "Zip Code",
  ],

  leadOwner: [
    "Lead Owner",
    "Owner",
    "Sales Person",
    "Assigned To",
  ],

  leadSource: [
    "Lead Source",
    "Source",
    "Inquiry Source",
  ],


  priority: [
    "Priority",
  ],

  status: [
    "Status",
  ],

  followupDate: [
  "Follow-up Date",
  "Followup Date",
  "Next Followup",
  "Next Follow-up",
  "Date",
],

  notes: [
    "Notes",
    "Remark",
    "Remarks",
    "Comment",
    "Comments",
  ],
};

export function normalizeHeader(
  value: string
): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ");
}

export function detectColumns(
  headers: string[]
): {
  detectedColumns: Partial<
    Record<CanonicalColumn, string>
  >;

  columnIndexes: Partial<
    Record<CanonicalColumn, number>
  >;
} {
  const lookup = new Map<string, number>();

  headers.forEach((header, index) => {
    const normalized = normalizeHeader(header);

    if (!lookup.has(normalized)) {
      lookup.set(normalized, index);
    }
  });

  const detectedColumns: Partial<
    Record<CanonicalColumn, string>
  > = {};

  const columnIndexes: Partial<
    Record<CanonicalColumn, number>
  > = {};

  (
    Object.keys(HEADER_SYNONYMS) as CanonicalColumn[]
  ).forEach((field) => {
    for (const synonym of HEADER_SYNONYMS[field]) {
      const index = lookup.get(
        normalizeHeader(synonym)
      );

      if (index !== undefined) {
        detectedColumns[field] = headers[index];
        columnIndexes[field] = index;
        break;
      }
    }
  });

  return {
    detectedColumns,
    columnIndexes,
  };
}