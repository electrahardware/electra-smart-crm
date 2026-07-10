import type { ReactNode } from "react";

import useAuthGuard from "../../hooks/useAuthGuard";

interface Props {
  children: ReactNode;
}

export default function AuthGuard({
  children,
}: Props) {

  useAuthGuard();

  return <>{children}</>;

}