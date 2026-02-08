import type { TextStyle } from "react-native";

import { colorSemanticTokens } from "@/design/tokens/colors";
import { elevationTokens } from "@/design/tokens/elevation";

export const premiumAuthUiTokens = {
  radius: {
    panel: 16,
    control: 16,
    chip: 12,
    micro: 8,
    button: 16,
    floatingFooter: 16,
  },
  spacing: {
    xxs: 4,
    xs: 6,
    sm: 12,
    md: 16,
    lg: 20,
    xl: 26,
    xxl: 34,
    screenHorizontal: 24,
  },
  motion: {
    pressDuration: 80,
    pressScale: 0.988,
    screenEnterDuration: 180,
  },
  color: {
    canvas: colorSemanticTokens.background.canvas,
    panel: colorSemanticTokens.surface.cardStrong,
    panelSubtle: colorSemanticTokens.surface.cardMuted,
    field: "#FFFFFF",
    floatingBar: colorSemanticTokens.background.chrome,
    border: colorSemanticTokens.border.subtle,
    borderStrong: colorSemanticTokens.border.muted,
    divider: colorSemanticTokens.border.subtle,
    fieldBorderFocus: colorSemanticTokens.accent.primary,
    textPrimary: colorSemanticTokens.text.primary,
    textSecondary: colorSemanticTokens.text.secondary,
    textMuted: colorSemanticTokens.text.tertiary,
    textSubtle: "#AFAFAF",
    error: colorSemanticTokens.state.danger,
    accent: colorSemanticTokens.accent.primary,
    accentSoft: colorSemanticTokens.accent.soft,
    accentBorder: colorSemanticTokens.border.accent,
  },
  shadow: {
    panel: elevationTokens.md,
    control: elevationTokens.xs,
    floatingFooter: elevationTokens.sm,
    primaryButton: elevationTokens.md,
  },
  typography: {
    eyebrow: {
      fontWeight: "600",
      fontSize: 11,
      lineHeight: 14,
      letterSpacing: 0.52,
    } satisfies TextStyle,
    title: {
      fontWeight: "700",
      fontSize: 32,
      lineHeight: 40,
      letterSpacing: -0.1,
    } satisfies TextStyle,
    subtitle: {
      fontWeight: "400",
      fontSize: 15,
      lineHeight: 24,
      letterSpacing: 0,
    } satisfies TextStyle,
    body: {
      fontWeight: "400",
      fontSize: 15,
      lineHeight: 24,
      letterSpacing: 0,
    } satisfies TextStyle,
    label: {
      fontWeight: "600",
      fontSize: 12,
      lineHeight: 16,
      letterSpacing: 0.24,
    } satisfies TextStyle,
    button: {
      fontWeight: "700",
      fontSize: 14,
      lineHeight: 18,
      letterSpacing: 0.4,
    } satisfies TextStyle,
    caption: {
      fontWeight: "400",
      fontSize: 12,
      lineHeight: 16,
      letterSpacing: 0.1,
    } satisfies TextStyle,
    link: {
      fontWeight: "600",
      fontSize: 12,
      lineHeight: 16,
      letterSpacing: 0.1,
    } satisfies TextStyle,
    chip: {
      fontWeight: "600",
      fontSize: 12,
      lineHeight: 15,
      letterSpacing: 0,
    } satisfies TextStyle,
  },
} as const;

export type PremiumAuthUiTokens = typeof premiumAuthUiTokens;
