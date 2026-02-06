export const colorTokens = {
  brand: {
    primary: "#5D18EB",
    primarySoft: "#EFE7FF",
  },
  text: {
    primary: "#11131A",
    secondary: "#5A6072",
    muted: "#7B8193",
    inverse: "#FFFFFF",
  },
  surface: {
    base: "#F7F8FC",
    glass: "rgba(255, 255, 255, 0.66)",
    card: "#FFFFFF",
    elevated: "#FFFFFF",
  },
  border: {
    glass: "rgba(255, 255, 255, 0.78)",
    subtle: "rgba(17, 19, 26, 0.08)",
  },
  orb: {
    primary: "rgba(93, 24, 235, 0.25)",
    secondary: "rgba(123, 205, 255, 0.24)",
    tertiary: "rgba(232, 196, 255, 0.24)",
  },
} as const;

export type ColorTokens = typeof colorTokens;
