import type { GroupType } from "@/features/groups/types/group.types";

export type GroupTypePreset = {
  type: GroupType;
  label: string;
  subtitle: string;
  defaultEmoji: string;
};

export const GROUP_TYPE_PRESETS: GroupTypePreset[] = [
  {
    type: "trip",
    label: "Trip",
    subtitle: "Travel with friends or family",
    defaultEmoji: "✈️",
  },
  {
    type: "home",
    label: "Home",
    subtitle: "Roommates and home costs",
    defaultEmoji: "🏠",
  },
  {
    type: "couple",
    label: "Couple",
    subtitle: "Shared spending as a pair",
    defaultEmoji: "❤️",
  },
  {
    type: "other",
    label: "Other",
    subtitle: "Anything else",
    defaultEmoji: "👥",
  },
];

export const GROUP_DEFAULT_EMOJI_BY_TYPE: Record<GroupType, string> = {
  trip: "✈️",
  home: "🏠",
  couple: "❤️",
  other: "👥",
};

export const GROUP_EMOJI_OPTIONS: string[] = [
  "✈️",
  "🏠",
  "❤️",
  "👥",
  "🍽️",
  "🎉",
  "🚗",
  "🏝️",
  "🏕️",
  "🧾",
  "🎬",
  "🎮",
  "💼",
  "📦",
  "🎓",
  "🛒",
];

export function getGroupTypeLabel(type: GroupType): string {
  const match = GROUP_TYPE_PRESETS.find((preset) => preset.type === type);
  return match?.label ?? "Other";
}
