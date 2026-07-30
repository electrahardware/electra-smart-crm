export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

export function getCurrentUser(): User | null {
  const user = localStorage.getItem("user");

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
