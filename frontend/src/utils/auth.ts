export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

export function getCurrentUser(): User | null {
  const user = sessionStorage.getItem("user");

  if (!user) {
    return null;
  }

  try {
    return JSON.parse(user);
  } catch {
    return null;
  }
}

export function getCurrentRole(): string {
  return getCurrentUser()?.role ?? "";
}

export function isOwner(): boolean {
  return getCurrentRole() === "Owner";
}

export function isSalesManager(): boolean {
  return getCurrentRole() === "Sales Manager";
}

export function isSalesExecutive(): boolean {
  return getCurrentRole() === "Sales Executive";
}

export function isOwnerOrManager(): boolean {
  return isOwner() || isSalesManager();
}

// Backward compatibility
export function isAdmin() {
  return isOwner();
}

export function isManager() {
  return isSalesManager();
}

export function isSales() {
  return isSalesExecutive();
}

export function isAdminOrManager() {
  return isOwnerOrManager();
}

export function canDeleteLead(): boolean {
  return isOwnerOrManager();
}

export function canManageUsers(): boolean {
  return isOwner();
}

export function canChangeLeadOwner(): boolean {
  return isOwnerOrManager();
}

export function canBulkDelete(): boolean {
  return isOwnerOrManager();
}

export function canImportLeads(): boolean {
  return isOwnerOrManager();
}

export function canExportLeads(): boolean {
  return isOwnerOrManager();
}

export function canViewAnalytics(): boolean {
  return isOwnerOrManager();
}

export function canEditLead(): boolean {
  return true;
}

export function canViewLead(): boolean {
  return true;
}

export function canCallCustomer(): boolean {
  return true;
}

export function canAddNote(): boolean {
  return true;
}
