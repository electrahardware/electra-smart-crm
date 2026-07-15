export interface ExportColumn {
  header: string;
  key: string;
}

export const IMPORT_EXPORT_COLUMNS: ExportColumn[] = [
  { header: "Lead Date", key: "leadDate" },
  { header: "Customer Name", key: "customerName" },
  { header: "Shop Name", key: "shopName" },
  { header: "Mobile", key: "mobile" },
  { header: "WhatsApp", key: "whatsapp" },
  { header: "Email", key: "email" },
  { header: "GST", key: "gst" },
  { header: "Address", key: "address" },
  { header: "Area", key: "area" },
  { header: "District", key: "district" },
  { header: "City", key: "city" },
  { header: "State", key: "state" },
  { header: "Pincode", key: "pincode" },
  { header: "Lead Owner", key: "leadOwner" },
  { header: "Lead Source", key: "leadSource" },
  { header: "Priority", key: "priority" },
  { header: "Status", key: "status" },
  { header: "Follow-up Date", key: "followupDate" },
  { header: "Notes 1", key: "note1" },
  { header: "Notes 2", key: "note2" },
  { header: "Notes 3", key: "note3" },
  { header: "Notes 4", key: "note4" },
  { header: "Notes 5", key: "note5" },
];