import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, Text, TextInput, View } from "@/design/primitives/sora-native";
import type { TextInputProps } from "@/design/primitives/sora-native";

import { useThemeColors } from "@/providers/theme-provider";
import { radiusTokens } from "@/design/tokens/radius";

export type FieldConfig = TextInputProps & {
  placeholder: string;
  secureTextEntry?: boolean;
  error?: string;
};

type AuthInputGroupProps = {
  fields: FieldConfig[];
};

function AuthInputField({
  field,
  colors,
}: {
  field: FieldConfig;
  colors: ReturnType<typeof useThemeColors>;
}) {
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
          color: colors.text.primary,
        }}
      >
        {field.placeholder}
      </Text>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: hasError
            ? colors.state.dangerSoft
            : colors.background.subtle,
          borderRadius: radiusTokens.control,
          borderCurve: "continuous",
          borderWidth: 1.5,
          borderColor: hasError
            ? colors.state.danger
            : isFocused
              ? colors.accent.primary
              : "transparent",
        }}
      >
        <TextInput
          {...field}
          secureTextEntry={isSecure}
          placeholderTextColor={colors.text.tertiary}
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
            color: colors.text.primary,
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
              color={colors.text.tertiary}
            />
          </Pressable>
        ) : null}
      </View>
      {hasError ? (
        <Text
          style={{
            fontSize: 12,
            fontWeight: "400",
            color: colors.state.danger,
          }}
        >
          {field.error}
        </Text>
      ) : null}
    </View>
  );
}

export function AuthInputGroup({ fields }: AuthInputGroupProps) {
  const colors = useThemeColors();
  return (
    <View style={{ gap: 16 }}>
      {fields.map((field, index) => (
        <AuthInputField key={index} field={field} colors={colors} />
      ))}
    </View>
  );
}
