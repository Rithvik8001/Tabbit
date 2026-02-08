export const elevationTokens = {
  none: "0 0px 0px rgba(11, 17, 32, 0)",
  xs: "0 1px 4px rgba(11, 17, 32, 0.06)",
  sm: "0 4px 10px rgba(11, 17, 32, 0.08)",
  md: "0 10px 24px rgba(11, 17, 32, 0.10)",
  lg: "0 18px 34px rgba(11, 17, 32, 0.14)",
  glass: "0 10px 24px rgba(19, 27, 48, 0.08)",
} as const;

export type ElevationTokens = typeof elevationTokens;
