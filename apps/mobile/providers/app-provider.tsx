import type { ReactNode } from "react";

import { AuthProvider } from "@/features/auth/state/auth-provider";

type AppProviderProps = {
  children: ReactNode;
};

export function AppProvider({ children }: AppProviderProps) {
  return <AuthProvider>{children}</AuthProvider>;
}
