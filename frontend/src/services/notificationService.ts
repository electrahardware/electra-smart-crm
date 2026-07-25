import { api } from "../lib/api";

export interface NotificationSummary {
  overdue: number;
  today: number;
  newLeads: number;
}

export function getNotifications() {

    console.log("notificationService called");
    
  return api<NotificationSummary>(
    "/leads/notifications"
  );
}