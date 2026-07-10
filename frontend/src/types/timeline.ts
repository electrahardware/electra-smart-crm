export interface Timeline {
  id: number;

  leadId: number;

  type: string;

  title: string;

  description?: string;

  createdBy?: string;

  createdAt: string;
}