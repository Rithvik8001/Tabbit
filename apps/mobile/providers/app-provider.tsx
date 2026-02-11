import type { ReactNode } from "react";

import { AuthProvider } from "@/features/auth/state/auth-provider";
import { ThemeProvider } from "@/providers/theme-provider";

type AppProviderProps = {
  children: ReactNode;
};

export function AppProvider({ children }: AppProviderProps) {
  return (
    <ThemeProvider>
      <AuthProvider>{children}</AuthProvider>
    </ThemeProvider>
  );
}
