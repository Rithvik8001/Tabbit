import type {
  SplitStyle,
  UseContext,
} from "@/features/onboarding/types/onboarding.types";

type SplitStyleOption = {
  value: SplitStyle;
  label: string;
  description: string;
};

type UseContextOption = {
  value: UseContext;
  label: string;
  description: string;
};

export const onboardingContent = {
  brand: "tabbit",
  hero: {
    kicker: "tabbit",
    title: "Shared expenses, without social friction.",
    subtitle:
      "Track every split with clarity and calm. Built for people, not spreadsheets.",
  },
  selectors: {
    splitStyleLabel: "How do you usually split?",
    contextLabel: "Who do you split with most?",
  },
  cta: {
    label: "Enter Preview",
    supportingNote: "No sign-up yet. You can edit preferences any time.",
  },
} as const;

export const splitStyleOptions: SplitStyleOption[] = [
  {
    value: "equal",
    label: "Equal",
    description: "Everyone shares the same amount.",
  },
  {
    value: "exact",
    label: "Exact",
    description: "Assign specific amounts per person.",
  },
  {
    value: "percent",
    label: "Percent",
    description: "Split by custom percentage shares.",
  },
];

export const useContextOptions: UseContextOption[] = [
  {
    value: "roommates",
    label: "Roommates",
    description: "Recurring home bills and utilities.",
  },
  {
    value: "travel",
    label: "Travel",
    description: "Trips, tickets, and shared bookings.",
  },
  {
    value: "couple",
    label: "Couple",
    description: "Daily expenses and shared goals.",
  },
  {
    value: "friends",
    label: "Friends",
    description: "Meals, events, and hangouts.",
  },
];
