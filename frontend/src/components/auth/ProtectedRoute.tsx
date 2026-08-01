import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";

import AuthGuard from "./AuthGuard";

interface Props {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: Props) {
  const token = sessionStorage.getItem("token");

  const user = sessionStorage.getItem("user");

  if (!token || !user) {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");

    return <Navigate to="/login" replace />;
  }

  return <AuthGuard>{children}</AuthGuard>;
}
