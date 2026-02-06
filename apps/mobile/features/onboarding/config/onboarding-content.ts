import type { SFSymbol } from "expo-symbols";

import type {
  SplitStyle,
  UseContext,
} from "@/features/onboarding/types/onboarding.types";

type ValuePillar = {
  symbol: SFSymbol;
  fallback: string;
  title: string;
  description: string;
};

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
  hero: {
    brand: "tabbit",
    title: "Split spending with zero awkwardness.",
    subtitle:
      "A calm, crystal-clear space for every shared expense and every balance.",
  },
  value: {
    title: "Built for clarity, speed, and fairness.",
    subtitle:
      "Track what matters and settle with confidence without the spreadsheet chaos.",
  },
  preferences: {
    title: "Shape your split style.",
    subtitle:
      "Pick your preferred setup now. You can change everything later in settings.",
  },
} as const;

export const valuePillars: ValuePillar[] = [
  {
    symbol: "eye.fill",
    fallback: "👁️",
    title: "Clarity first",
    description: "See who paid, who owes, and what changed at a glance.",
  },
  {
    symbol: "bolt.fill",
    fallback: "⚡",
    title: "Fast updates",
    description: "Add expenses in seconds with polished, low-friction interactions.",
  },
  {
    symbol: "person.3.fill",
    fallback: "🧑‍🤝‍🧑",
    title: "Fair outcomes",
    description: "Flexible split rules keep every group balanced and transparent.",
  },
];

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
