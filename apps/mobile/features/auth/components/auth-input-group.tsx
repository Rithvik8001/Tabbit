import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, TextInput, View } from "react-native";
import type { TextInputProps } from "react-native";

type FieldConfig = TextInputProps & {
  placeholder: string;
  secureTextEntry?: boolean;
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

  return (
    <View>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
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
  return (
    <View
      style={{
        borderRadius: 16,
        borderCurve: "continuous",
        backgroundColor: "#F7F7F7",
        borderWidth: 2,
        borderColor: "#E5E5E5",
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
