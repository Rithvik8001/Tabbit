import type { TextStyle } from "react-native";

import { colorSemanticTokens } from "@/design/tokens/colors";
import { elevationTokens } from "@/design/tokens/elevation";
import { fontFamilyTokens } from "@/design/tokens/typography";

export const premiumAuthUiTokens = {
  radius: {
    panel: 18,
    control: 14,
    chip: 11,
    micro: 9,
    button: 14,
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
    screenHorizontal: 20,
  },
  motion: {
    pressDuration: 108,
    pressScale: 0.988,
    screenEnterDuration: 180,
  },
  color: {
    canvas: colorSemanticTokens.background.canvas,
    panel: colorSemanticTokens.surface.cardStrong,
    panelSubtle: colorSemanticTokens.surface.cardMuted,
    field: "rgba(255, 255, 255, 0.98)",
    floatingBar: colorSemanticTokens.background.chrome,
    border: colorSemanticTokens.border.subtle,
    borderStrong: colorSemanticTokens.border.muted,
    divider: colorSemanticTokens.border.subtle,
    fieldBorderFocus: colorSemanticTokens.border.accent,
    textPrimary: colorSemanticTokens.text.primary,
    textSecondary: colorSemanticTokens.text.secondary,
    textMuted: colorSemanticTokens.text.tertiary,
    textSubtle: "#8391A8",
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
      fontFamily: fontFamilyTokens.bodySemiBold,
      fontWeight: "600",
      fontSize: 11,
      lineHeight: 14,
      letterSpacing: 0.52,
    } satisfies TextStyle,
    title: {
      fontFamily: fontFamilyTokens.displaySemiBold,
      fontWeight: "600",
      fontSize: 32,
      lineHeight: 36,
      letterSpacing: -0.62,
    } satisfies TextStyle,
    subtitle: {
      fontFamily: fontFamilyTokens.bodyRegular,
      fontWeight: "400",
      fontSize: 15,
      lineHeight: 22,
      letterSpacing: -0.08,
    } satisfies TextStyle,
    body: {
      fontFamily: fontFamilyTokens.bodyRegular,
      fontWeight: "400",
      fontSize: 15,
      lineHeight: 21,
      letterSpacing: -0.08,
    } satisfies TextStyle,
    label: {
      fontFamily: fontFamilyTokens.bodyMedium,
      fontWeight: "500",
      fontSize: 12,
      lineHeight: 16,
      letterSpacing: 0.24,
    } satisfies TextStyle,
    button: {
      fontFamily: fontFamilyTokens.bodySemiBold,
      fontWeight: "600",
      fontSize: 14,
      lineHeight: 18,
      letterSpacing: 0.02,
    } satisfies TextStyle,
    caption: {
      fontFamily: fontFamilyTokens.bodyRegular,
      fontWeight: "400",
      fontSize: 12,
      lineHeight: 16,
      letterSpacing: 0.04,
    } satisfies TextStyle,
    link: {
      fontFamily: fontFamilyTokens.bodyMedium,
      fontWeight: "500",
      fontSize: 12,
      lineHeight: 16,
      letterSpacing: 0.02,
    } satisfies TextStyle,
    chip: {
      fontFamily: fontFamilyTokens.bodyMedium,
      fontWeight: "500",
      fontSize: 12,
      lineHeight: 15,
      letterSpacing: 0,
    } satisfies TextStyle,
  },
} as const;

export type PremiumAuthUiTokens = typeof premiumAuthUiTokens;
