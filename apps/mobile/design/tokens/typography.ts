import type { TextStyle } from "react-native";

export const fontFamilyTokens = {
  bodyRegular: "Sora_400Regular",
  bodyMedium: "Sora_500Medium",
  bodySemiBold: "Sora_600SemiBold",
  bodyBold: "Sora_700Bold",
  displayRegular: "Sora_400Regular",
  displayMedium: "Sora_500Medium",
  displaySemiBold: "Sora_700Bold",
  displayBold: "Sora_800ExtraBold",
  regular: "Sora_400Regular",
  medium: "Sora_500Medium",
  semibold: "Sora_600SemiBold",
  bold: "Sora_700Bold",
} as const;

type TypographyVariant = Pick<
  TextStyle,
  "fontSize" | "lineHeight" | "letterSpacing" | "fontWeight" | "fontFamily"
>;

export type TypographyTokens = Record<
  | "displayXl"
  | "displayLg"
  | "displayMd"
  | "headingLg"
  | "headingMd"
  | "headingSm"
  | "bodyLg"
  | "bodyMd"
  | "bodySm"
  | "labelLg"
  | "labelMd"
  | "labelSm"
  | "caption",
  TypographyVariant
>;

export const typographyScale: TypographyTokens = {
  displayXl: {
    fontFamily: fontFamilyTokens.displayBold,
    fontSize: 42,
    lineHeight: 52,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  displayLg: {
    fontFamily: fontFamilyTokens.displaySemiBold,
    fontSize: 34,
    lineHeight: 44,
    fontWeight: "600",
    letterSpacing: -0.2,
  },
  displayMd: {
    fontFamily: fontFamilyTokens.displaySemiBold,
    fontSize: 28,
    lineHeight: 38,
    fontWeight: "600",
    letterSpacing: -0.1,
  },
  headingLg: {
    fontFamily: fontFamilyTokens.bodyBold,
    fontSize: 24,
    lineHeight: 34,
    fontWeight: "600",
    letterSpacing: 0,
  },
  headingMd: {
    fontFamily: fontFamilyTokens.bodyBold,
    fontSize: 20,
    lineHeight: 28,
    fontWeight: "600",
    letterSpacing: 0,
  },
  headingSm: {
    fontFamily: fontFamilyTokens.bodySemiBold,
    fontSize: 17,
    lineHeight: 24,
    fontWeight: "600",
    letterSpacing: 0,
  },
  bodyLg: {
    fontFamily: fontFamilyTokens.bodyRegular,
    fontSize: 16,
    lineHeight: 28,
    fontWeight: "400",
    letterSpacing: 0,
  },
  bodyMd: {
    fontFamily: fontFamilyTokens.bodyRegular,
    fontSize: 15,
    lineHeight: 26,
    fontWeight: "400",
    letterSpacing: 0,
  },
  bodySm: {
    fontFamily: fontFamilyTokens.bodyRegular,
    fontSize: 13,
    lineHeight: 22,
    fontWeight: "400",
    letterSpacing: 0,
  },
  labelLg: {
    fontFamily: fontFamilyTokens.bodyMedium,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "500",
    letterSpacing: 0,
  },
  labelMd: {
    fontFamily: fontFamilyTokens.bodyMedium,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "500",
    letterSpacing: 0,
  },
  labelSm: {
    fontFamily: fontFamilyTokens.bodyMedium,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "500",
    letterSpacing: 0,
  },
  caption: {
    fontFamily: fontFamilyTokens.bodyRegular,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "400",
    letterSpacing: 0.2,
  },
};

export const typographyTokens: Record<
  "display" | "title" | "body" | "label" | "caption",
  TypographyVariant
> = {
  display: {
    ...typographyScale.displayLg,
  },
  title: {
    ...typographyScale.headingLg,
  },
  body: {
    ...typographyScale.bodyLg,
  },
  label: {
    ...typographyScale.labelMd,
  },
  caption: {
    ...typographyScale.caption,
  },
};
