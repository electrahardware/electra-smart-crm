export interface Quotation {

  id?: number;

  leadId: number;

  quotationNo: string;

  customerName: string;

  companyName?: string;

  mobile: string;

  address?: string;

  subtotal: number;

  discount: number;

  gst: number;

  total: number;

  status:
    | "Draft"
    | "Sent"
    | "Approved"
    | "Rejected";

  createdAt?: string;

}

export interface QuotationItem {

  id?: number;

  product: string;

  description?: string;

  qty: number;

  rate: number;

  amount: number;

}