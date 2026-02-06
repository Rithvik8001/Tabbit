export type OnboardingStep = "single";
export type SplitStyle = "equal" | "exact" | "percent";
export type UseContext = "roommates" | "travel" | "couple" | "friends";

export interface OnboardingDraft {
  splitStyle: SplitStyle | null;
  useContext: UseContext | null;
  displayName: string | null;
}
