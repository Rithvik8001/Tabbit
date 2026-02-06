export const colorTokens = {
  brand: {
    primary: "#5D18EB",
    primarySoft: "#F3EEFF",
  },
  text: {
    primary: "#14161D",
    secondary: "#5F6472",
    muted: "#8A8F9E",
    inverse: "#FFFFFF",
  },
  surface: {
    base: "#F5F6F8",
    glass: "rgba(255, 255, 255, 0.72)",
    card: "#FFFFFF",
    elevated: "#FCFCFD",
  },
  border: {
    glass: "rgba(255, 255, 255, 0.85)",
    subtle: "rgba(20, 22, 29, 0.10)",
    strong: "rgba(20, 22, 29, 0.16)",
  },
} as const;

export type ColorTokens = typeof colorTokens;
