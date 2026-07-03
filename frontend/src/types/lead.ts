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
  area: string;
  pincode: string;

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

  notes: string;

  createdAt?: string;
  updatedAt?: string;
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
  area: "",
  pincode: "",

  addressLine1: "",
  addressLine2: "",

  website: "",

  leadOwner: "",
  leadSource: "",
  language: "",

  products: [],

  priority: "",
  status: "",

  expectedValue: 0,
  probability: 0,

  followupDate: "",
  followupTime: "",

  notes: "",
};