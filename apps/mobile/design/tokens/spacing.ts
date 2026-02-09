export const spacingTokens = {
  hairline: 2,
  xxs: 4,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  "3xl": 32,
  "4xl": 40,
  "5xl": 48,
  "6xl": 56,
  screenHorizontal: 24,
  screenHorizontalTight: 16,
  screenHorizontalWide: 28,
  sectionGap: 28,
  cardPadding: 24,
} as const;

export type SpacingScale = typeof spacingTokens;
export type SpacingTokens = SpacingScale;
