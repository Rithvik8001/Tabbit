import type { ReactNode } from "react";
import { createContext, useContext, useMemo, useState } from "react";

import type {
  OnboardingDraft,
  SplitStyle,
  UseContext as OnboardingUseContext,
} from "@/features/onboarding/types/onboarding.types";

type OnboardingStoreValue = {
  draft: OnboardingDraft;
  setSplitStyle: (value: SplitStyle) => void;
  setUseContextValue: (value: OnboardingUseContext) => void;
  setDisplayName: (value: string) => void;
  resetDraft: () => void;
};

const initialDraft: OnboardingDraft = {
  splitStyle: null,
  useContext: null,
  displayName: null,
};

const OnboardingStoreContext = createContext<OnboardingStoreValue | null>(null);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [draft, setDraft] = useState<OnboardingDraft>(initialDraft);

  const value = useMemo<OnboardingStoreValue>(() => {
    return {
      draft,
      setSplitStyle: (nextSplitStyle) => {
        setDraft((prevDraft) => ({ ...prevDraft, splitStyle: nextSplitStyle }));
      },
      setUseContextValue: (nextUseContext) => {
        setDraft((prevDraft) => ({ ...prevDraft, useContext: nextUseContext }));
      },
      setDisplayName: (nextDisplayName) => {
        setDraft((prevDraft) => ({ ...prevDraft, displayName: nextDisplayName }));
      },
      resetDraft: () => {
        setDraft(initialDraft);
      },
    };
  }, [draft]);

  return (
    <OnboardingStoreContext.Provider value={value}>
      {children}
    </OnboardingStoreContext.Provider>
  );
}

export function useOnboardingStore() {
  const context = useContext(OnboardingStoreContext);
  if (!context) {
    throw new Error("useOnboardingStore must be used inside OnboardingProvider");
  }
  return context;
}
