import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";

import AuthGuard from "./AuthGuard";

interface Props {
  children: ReactNode;
}

export default function ProtectedRoute({
  children,
}: Props) {

  const token =
  localStorage.getItem("token");

const user =
  localStorage.getItem("user");

if (
  !token ||
  !user
) {

  localStorage.removeItem("token");
  localStorage.removeItem("user");

  return (
    <Navigate
      to="/login"
      replace
    />
  );

}

  return (

    <AuthGuard>

      {children}

    </AuthGuard>

  );

}