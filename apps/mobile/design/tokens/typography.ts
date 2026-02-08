import type { TextStyle } from "react-native";

export const fontFamilyTokens = {
  bodyRegular: "Geist_400Regular",
  bodyMedium: "Geist_500Medium",
  bodySemiBold: "Geist_600SemiBold",
  bodyBold: "Geist_700Bold",
  displayRegular: "InstrumentSans_400Regular",
  displayMedium: "InstrumentSans_500Medium",
  displaySemiBold: "InstrumentSans_600SemiBold",
  displayBold: "InstrumentSans_700Bold",
  regular: "Geist_400Regular",
  medium: "Geist_500Medium",
  semibold: "Geist_600SemiBold",
  bold: "Geist_700Bold",
} as const;

type TypographyVariant = Pick<
  TextStyle,
  "fontFamily" | "fontSize" | "lineHeight" | "letterSpacing" | "fontWeight"
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
    lineHeight: 48,
    fontWeight: "700",
    letterSpacing: -0.9,
  },
  displayLg: {
    fontFamily: fontFamilyTokens.displaySemiBold,
    fontSize: 34,
    lineHeight: 40,
    fontWeight: "600",
    letterSpacing: -0.65,
  },
  displayMd: {
    fontFamily: fontFamilyTokens.displaySemiBold,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "600",
    letterSpacing: -0.48,
  },
  headingLg: {
    fontFamily: fontFamilyTokens.bodyBold,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: "700",
    letterSpacing: -0.38,
  },
  headingMd: {
    fontFamily: fontFamilyTokens.bodySemiBold,
    fontSize: 20,
    lineHeight: 25,
    fontWeight: "600",
    letterSpacing: -0.28,
  },
  headingSm: {
    fontFamily: fontFamilyTokens.bodySemiBold,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "600",
    letterSpacing: -0.2,
  },
  bodyLg: {
    fontFamily: fontFamilyTokens.bodyRegular,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "400",
    letterSpacing: -0.12,
  },
  bodyMd: {
    fontFamily: fontFamilyTokens.bodyRegular,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "400",
    letterSpacing: -0.08,
  },
  bodySm: {
    fontFamily: fontFamilyTokens.bodyRegular,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "400",
    letterSpacing: -0.02,
  },
  labelLg: {
    fontFamily: fontFamilyTokens.bodySemiBold,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "600",
    letterSpacing: -0.05,
  },
  labelMd: {
    fontFamily: fontFamilyTokens.bodyMedium,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "500",
    letterSpacing: 0.02,
  },
  labelSm: {
    fontFamily: fontFamilyTokens.bodyMedium,
    fontSize: 12,
    lineHeight: 15,
    fontWeight: "500",
    letterSpacing: 0.08,
  },
  caption: {
    fontFamily: fontFamilyTokens.bodyRegular,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "400",
    letterSpacing: 0.12,
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
