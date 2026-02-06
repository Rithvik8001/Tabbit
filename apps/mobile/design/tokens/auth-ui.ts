import type { TextStyle } from "react-native";

import { colorTokens } from "@/design/tokens/color";
import { fontFamilyTokens } from "@/design/tokens/typography";

export const premiumAuthUiTokens = {
  radius: {
    panel: 12,
    control: 10,
    chip: 9,
    micro: 8,
    button: 10,
    floatingFooter: 12,
  },
  spacing: {
    xxs: 4,
    xs: 8,
    sm: 12,
    md: 16,
    lg: 20,
    xl: 28,
    xxl: 36,
    screenHorizontal: 24,
  },
  motion: {
    pressDuration: 96,
    pressScale: 0.994,
    screenEnterDuration: 150,
  },
  color: {
    canvas: "#F4F6F8",
    panel: "rgba(255, 255, 255, 0.96)",
    panelSubtle: "rgba(248, 249, 251, 0.98)",
    field: "rgba(255, 255, 255, 1)",
    floatingBar: "rgba(247, 248, 250, 0.98)",
    border: "rgba(17, 20, 26, 0.12)",
    borderStrong: "rgba(17, 20, 26, 0.18)",
    divider: "rgba(17, 20, 26, 0.10)",
    fieldBorderFocus: "rgba(93, 24, 235, 0.42)",
    textPrimary: "#11141A",
    textSecondary: "#4B5260",
    textMuted: "#717A8A",
    textSubtle: "#96A0AF",
    error: "#B03030",
    accent: colorTokens.brand.primary,
    accentSoft: "rgba(93, 24, 235, 0.10)",
    accentBorder: "rgba(93, 24, 235, 0.36)",
  },
  shadow: {
    panel: "0 4px 12px rgba(17, 20, 26, 0.05)",
    control: "0 1px 4px rgba(17, 20, 26, 0.05)",
    floatingFooter: "0 6px 18px rgba(17, 20, 26, 0.08)",
    primaryButton: "0 6px 12px rgba(17, 20, 26, 0.13)",
  },
  typography: {
    eyebrow: {
      fontFamily: fontFamilyTokens.semibold,
      fontWeight: "600",
      fontSize: 11,
      lineHeight: 15,
      letterSpacing: 0.45,
    } satisfies TextStyle,
    title: {
      fontFamily: fontFamilyTokens.bold,
      fontWeight: "700",
      fontSize: 30,
      lineHeight: 35,
      letterSpacing: -0.52,
    } satisfies TextStyle,
    subtitle: {
      fontFamily: fontFamilyTokens.regular,
      fontWeight: "400",
      fontSize: 15,
      lineHeight: 22,
      letterSpacing: -0.04,
    } satisfies TextStyle,
    body: {
      fontFamily: fontFamilyTokens.regular,
      fontWeight: "400",
      fontSize: 15,
      lineHeight: 21,
      letterSpacing: -0.1,
    } satisfies TextStyle,
    label: {
      fontFamily: fontFamilyTokens.medium,
      fontWeight: "500",
      fontSize: 12,
      lineHeight: 16,
      letterSpacing: 0.18,
    } satisfies TextStyle,
    button: {
      fontFamily: fontFamilyTokens.semibold,
      fontWeight: "600",
      fontSize: 13,
      lineHeight: 17,
      letterSpacing: 0.08,
    } satisfies TextStyle,
    caption: {
      fontFamily: fontFamilyTokens.regular,
      fontWeight: "400",
      fontSize: 12,
      lineHeight: 16,
      letterSpacing: 0,
    } satisfies TextStyle,
    link: {
      fontFamily: fontFamilyTokens.medium,
      fontWeight: "500",
      fontSize: 12,
      lineHeight: 16,
      letterSpacing: 0,
    } satisfies TextStyle,
    chip: {
      fontFamily: fontFamilyTokens.medium,
      fontWeight: "500",
      fontSize: 12,
      lineHeight: 15,
      letterSpacing: 0,
    } satisfies TextStyle,
  },
} as const;

export type PremiumAuthUiTokens = typeof premiumAuthUiTokens;
