export const elevationTokens = {
  none: "0 0px 0px rgba(0, 0, 0, 0)",
  xs: "0 1px 3px rgba(0, 0, 0, 0.06)",
  sm: "0 2px 8px rgba(0, 0, 0, 0.08)",
  md: "0 4px 12px rgba(0, 0, 0, 0.10)",
  lg: "0 8px 24px rgba(0, 0, 0, 0.12)",
  glass: "0 2px 8px rgba(0, 0, 0, 0.08)",
} as const;

export type ElevationTokens = typeof elevationTokens;
