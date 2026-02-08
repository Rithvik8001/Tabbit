import { colorSemanticTokens } from "@/design/tokens/colors";
import { radiusTokens } from "@/design/tokens/radius";

export const glassTokens = {
  iosIntensity: 0,
  fallbackIntensity: 0,
  borderColor: colorSemanticTokens.border.subtle,
  background: "#FFFFFF",
  backgroundStrong: "#FFFFFF",
  radius: radiusTokens.lg,
} as const;

export type GlassTokens = typeof glassTokens;
