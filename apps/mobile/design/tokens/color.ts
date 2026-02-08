import { colorSemanticTokens } from "@/design/tokens/colors";

export const colorTokens = {
  brand: {
    primary: colorSemanticTokens.accent.primary,
    primarySoft: colorSemanticTokens.accent.soft,
  },
  text: {
    primary: colorSemanticTokens.text.primary,
    secondary: colorSemanticTokens.text.secondary,
    muted: colorSemanticTokens.text.tertiary,
    inverse: colorSemanticTokens.text.inverse,
  },
  surface: {
    base: colorSemanticTokens.background.canvas,
    glass: colorSemanticTokens.surface.glass,
    card: colorSemanticTokens.surface.cardStrong,
    elevated: colorSemanticTokens.surface.card,
  },
  border: {
    glass: colorSemanticTokens.border.glass,
    subtle: colorSemanticTokens.border.subtle,
    strong: colorSemanticTokens.border.strong,
  },
} as const;

export type ColorTokens = typeof colorTokens;
