export const radiusTokens = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 16,
  xl: 24,
  card: 16,
  button: 16,
  control: 16,
  pill: 999,
} as const;

export type RadiusScale = typeof radiusTokens;
export type RadiusTokens = RadiusScale;
