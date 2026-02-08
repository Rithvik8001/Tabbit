import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import type { TextInputProps } from "react-native";

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
  isLast,
}: {
  field: FieldConfig;
  isLast: boolean;
}) {
  const [isSecure, setIsSecure] = useState(field.secureTextEntry ?? false);
  const hasEyeToggle = field.secureTextEntry;
  const hasError = !!field.error;

  return (
    <View>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: hasError ? "#FFF5F5" : undefined,
        }}
      >
        <TextInput
          {...field}
          secureTextEntry={isSecure}
          placeholderTextColor="#AFAFAF"
          style={{
            flex: 1,
            paddingHorizontal: 16,
            paddingVertical: 14,
            fontSize: 16,
            fontWeight: "400",
            color: "#3C3C3C",
          }}
        />
        {hasEyeToggle ? (
          <Pressable
            onPress={() => setIsSecure((prev) => !prev)}
            hitSlop={8}
            style={{ paddingRight: 16 }}
          >
            <Ionicons
              name={isSecure ? "eye-off-outline" : "eye-outline"}
              size={22}
              color="#AFAFAF"
            />
          </Pressable>
        ) : null}
      </View>
      {hasError ? (
        <Text
          style={{
            fontSize: 12,
            fontWeight: "400",
            color: "#FF4B4B",
            paddingHorizontal: 16,
            paddingBottom: 8,
            backgroundColor: "#FFF5F5",
          }}
        >
          {field.error}
        </Text>
      ) : null}
      {!isLast ? (
        <View
          style={{
            height: 1,
            backgroundColor: "#E5E5E5",
            marginHorizontal: 0,
          }}
        />
      ) : null}
    </View>
  );
}

export function AuthInputGroup({ fields }: AuthInputGroupProps) {
  const hasAnyError = fields.some((f) => !!f.error);

  return (
    <View
      style={{
        borderRadius: 16,
        borderCurve: "continuous",
        backgroundColor: "#F7F7F7",
        borderWidth: 2,
        borderColor: hasAnyError ? "#FF4B4B" : "#E5E5E5",
        overflow: "hidden",
      }}
    >
      {fields.map((field, index) => (
        <AuthInputField
          key={index}
          field={field}
          isLast={index === fields.length - 1}
        />
      ))}
    </View>
  );
}
