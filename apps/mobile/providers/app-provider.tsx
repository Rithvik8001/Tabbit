import type { ReactNode } from "react";

import { AuthProvider } from "@/features/auth/state/auth-provider";
import { OnboardingProvider } from "@/features/onboarding/state/onboarding.store";

type AppProviderProps = {
  children: ReactNode;
};

export function AppProvider({ children }: AppProviderProps) {
  return (
    <AuthProvider>
      <OnboardingProvider>{children}</OnboardingProvider>
    </AuthProvider>
  );
}
