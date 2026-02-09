import React, { forwardRef } from "react";
import {
  ActivityIndicator,
  Alert,
  AppState,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text as RNText,
  TextInput as RNTextInput,
  View,
  type AppStateStatus,
  type GestureResponderEvent,
  type StyleProp,
  type TextInputProps,
  type TextProps,
  type TextStyle,
  type ViewStyle,
} from "react-native";

export {
  ActivityIndicator,
  Alert,
  AppState,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Switch,
  View,
};

export type {
  AppStateStatus,
  GestureResponderEvent,
  StyleProp,
  TextInputProps,
  TextProps,
  TextStyle,
  ViewStyle,
};

function resolveSoraFamily(fontWeight?: TextStyle["fontWeight"]) {
  if (fontWeight === undefined || fontWeight === null) {
    return "Sora_500Medium";
  }

  const normalized = String(fontWeight).toLowerCase();
  if (normalized === "normal") {
    return "Sora_400Regular";
  }

  if (normalized === "bold") {
    return "Sora_700Bold";
  }

  const numericWeight = Number.parseInt(normalized, 10);
  if (Number.isNaN(numericWeight)) {
    return "Sora_500Medium";
  }

  if (numericWeight >= 800) {
    return "Sora_800ExtraBold";
  }

  if (numericWeight >= 700) {
    return "Sora_700Bold";
  }

  if (numericWeight >= 600) {
    return "Sora_600SemiBold";
  }

  if (numericWeight >= 500) {
    return "Sora_500Medium";
  }

  return "Sora_400Regular";
}

function withSoraFont(
  style: TextProps["style"] | TextInputProps["style"],
): TextProps["style"] {
  const flattened = StyleSheet.flatten(style) as TextStyle | undefined;
  if (flattened?.fontFamily) {
    return style as TextProps["style"];
  }

  return [
    {
      fontFamily: resolveSoraFamily(flattened?.fontWeight),
    },
    style,
  ];
}

export const Text = forwardRef<React.ComponentRef<typeof RNText>, TextProps>(function Text(
  { style, ...rest },
  ref,
) {
  return <RNText ref={ref} {...rest} style={withSoraFont(style)} />;
});

export const TextInput = forwardRef<
  React.ComponentRef<typeof RNTextInput>,
  TextInputProps
>(function TextInput({ style, ...rest }, ref) {
  return <RNTextInput ref={ref} {...rest} style={withSoraFont(style)} />;
});
