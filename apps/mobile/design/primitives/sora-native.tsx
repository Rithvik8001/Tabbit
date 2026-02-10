import React, { forwardRef } from "react";
import {
  ActivityIndicator,
  Alert,
  AppState,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
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

export const Text = forwardRef<React.ComponentRef<typeof RNText>, TextProps>(function Text(
  { style, ...rest },
  ref,
) {
  return <RNText ref={ref} {...rest} style={style} />;
});

export const TextInput = forwardRef<
  React.ComponentRef<typeof RNTextInput>,
  TextInputProps
>(function TextInput({ style, ...rest }, ref) {
  return <RNTextInput ref={ref} {...rest} style={style} />;
});
