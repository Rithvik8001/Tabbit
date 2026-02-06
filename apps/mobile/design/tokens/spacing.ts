export const spacingTokens = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  "3xl": 32,
  "4xl": 40,
  screenHorizontal: 20,
} as const;

export type SpacingTokens = typeof spacingTokens;
