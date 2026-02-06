import type { ReactNode } from "react";

import { OnboardingProvider } from "@/features/onboarding/state/onboarding.store";

type AppProviderProps = {
  children: ReactNode;
};

export function AppProvider({ children }: AppProviderProps) {
  return <OnboardingProvider>{children}</OnboardingProvider>;
}
