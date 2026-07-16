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

  try {

    return JSON.parse(user);

  } catch {

    return null;

  }

}

export function getCurrentRole() {

  return (
    getCurrentUser()?.role ??
    ""
  );

}

export function isOwner() {

  return (
    getCurrentRole() ===
    "Owner"
  );

}

export function isManager() {

  return (
    getCurrentRole() ===
    "Manager"
  );

}

export function isSales() {

  return (
    getCurrentRole() ===
    "Sales"
  );

}