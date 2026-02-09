import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import type { TextInputProps } from "react-native";

import { colorSemanticTokens } from "@/design/tokens/colors";
import { radiusTokens } from "@/design/tokens/radius";

export type FieldConfig = TextInputProps & {
  placeholder: string;
  secureTextEntry?: boolean;
  error?: string;
};

type AuthInputGroupProps = {
  fields: FieldConfig[];
};

function AuthInputField({ field }: { field: FieldConfig }) {
  const [isSecure, setIsSecure] = useState(field.secureTextEntry ?? false);
  const [isFocused, setIsFocused] = useState(false);
  const hasEyeToggle = field.secureTextEntry;
  const hasError = !!field.error;

  return (
    <View style={{ gap: 6 }}>
      <Text
        style={{
          fontSize: 13,
          fontWeight: "500",
          color: colorSemanticTokens.text.primary,
        }}
      >
        {field.placeholder}
      </Text>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: hasError
            ? "rgba(239, 68, 68, 0.06)"
            : colorSemanticTokens.background.subtle,
          borderRadius: radiusTokens.control,
          borderCurve: "continuous",
          borderWidth: 1.5,
          borderColor: hasError
            ? colorSemanticTokens.state.danger
            : isFocused
              ? colorSemanticTokens.accent.primary
              : "transparent",
        }}
      >
        <TextInput
          {...field}
          secureTextEntry={isSecure}
          placeholderTextColor={colorSemanticTokens.text.tertiary}
          onFocus={(e) => {
            setIsFocused(true);
            field.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            field.onBlur?.(e);
          }}
          style={{
            flex: 1,
            paddingHorizontal: 14,
            paddingVertical: 14,
            fontSize: 16,
            fontWeight: "400",
            color: colorSemanticTokens.text.primary,
          }}
        />
        {hasEyeToggle ? (
          <Pressable
            onPress={() => setIsSecure((prev) => !prev)}
            hitSlop={8}
            style={{ paddingRight: 14 }}
          >
            <Ionicons
              name={isSecure ? "eye-off-outline" : "eye-outline"}
              size={22}
              color={colorSemanticTokens.text.tertiary}
            />
          </Pressable>
        ) : null}
      </View>
      {hasError ? (
        <Text
          style={{
            fontSize: 12,
            fontWeight: "400",
            color: colorSemanticTokens.state.danger,
          }}
        >
          {field.error}
        </Text>
      ) : null}
    </View>
  );
}

export function AuthInputGroup({ fields }: AuthInputGroupProps) {
  return (
    <View style={{ gap: 16 }}>
      {fields.map((field, index) => (
        <AuthInputField key={index} field={field} />
      ))}
    </View>
  );
}
