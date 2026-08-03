export interface Lead {
  id?: number;

  customerName: string;
  mobile: string;
  whatsapp: string;
  secondaryMobile: string;

  shopName: string;
  customerType: string;

  email: string;
  gst: string;

  country: string;
state: string;
district: string;
city: string;
area: string;
pincode: string;

leadDate: string;

  addressLine1: string;
  addressLine2: string;

  website: string;

  leadOwner: string;
  leadSource: string;
  language: string;

  products: string[];

  priority: string;
  status: string;

  expectedValue: number;
  probability: number;

  followupDate: string;
  followupTime: string;

  followupCompleted?: boolean;

followupCompletedAt?: string | null;

  notes: string;

  createdAt?: string;
  updatedAt?: string;
  lastEditedAt?: string | null;
}

export const EmptyLead: Lead = {
  customerName: "",
  mobile: "",
  whatsapp: "",
  secondaryMobile: "",

  shopName: "",
  customerType: "",

  email: "",
  gst: "",

  country: "India",

state: "",
district: "",
city: "",
area: "",
pincode: "",

leadDate: new Date()
  .toISOString()
  .slice(0, 10),

  addressLine1: "",
  addressLine2: "",

  website: "",

  leadOwner: "",
  leadSource: "",
  language: "",

  products: [],

  priority: "",
  status: "None",

  expectedValue: 0,
  probability: 0,

  followupDate: "",
  followupTime: "",

  notes: "",
};
