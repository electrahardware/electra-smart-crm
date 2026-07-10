export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

export function getCurrentUser(): User | null {

  const user =
    localStorage.getItem("user");

  if (!user) {
    return null;
  }

  return JSON.parse(user);

}

export function isOwner() {
  return (
    getCurrentUser()?.role ===
    "Owner"
  );
}

export function isManager() {
  return (
    getCurrentUser()?.role ===
    "Manager"
  );
}

export function isSales() {
  return (
    getCurrentUser()?.role ===
    "Sales"
  );
}