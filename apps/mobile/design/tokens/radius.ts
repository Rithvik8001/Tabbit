export const radiusTokens = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 16,
  xl: 24,
  card: 20,
  button: 14,
  control: 12,
  pill: 999,
} as const;

export type RadiusScale = typeof radiusTokens;
export type RadiusTokens = RadiusScale;
