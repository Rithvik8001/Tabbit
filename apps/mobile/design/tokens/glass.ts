import { colorSemanticTokens } from "@/design/tokens/colors";
import { radiusTokens } from "@/design/tokens/radius";

export const glassTokens = {
  iosIntensity: 54,
  fallbackIntensity: 44,
  borderColor: colorSemanticTokens.border.glass,
  background: colorSemanticTokens.surface.glass,
  backgroundStrong: colorSemanticTokens.surface.glassStrong,
  radius: radiusTokens.lg,
} as const;

export type GlassTokens = typeof glassTokens;
