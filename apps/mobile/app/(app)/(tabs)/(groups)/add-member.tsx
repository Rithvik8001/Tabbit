import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";

import { isValidEmail } from "@/features/auth/utils/auth-validation";
import { useGroupDetail } from "@/features/groups/hooks/use-group-detail";

const surface = "#FFFFFF";
const stroke = "#E8ECF2";
const ink = "#0F172A";
const muted = "#5C6780";
const accent = "#4A29FF";

export default function AddMemberScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { addMember, isAddingMember } = useGroupDetail(id);

  const [email, setEmail] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const handleAdd = () => {
    const trimmed = email.trim();

    if (!isValidEmail(trimmed)) {
      setFormError("Enter a valid email address.");
      return;
    }

    setFormError(null);

    void (async () => {
      const result = await addMember(trimmed);

      if (!result.ok) {
        setFormError(result.message);
        return;
      }

      router.back();
    })();
  };

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 24,
        gap: 12,
      }}
    >
      <View
        style={{
          borderRadius: 20,
          borderCurve: "continuous",
          borderWidth: 1,
          borderColor: stroke,
          backgroundColor: surface,
          padding: 16,
          gap: 10,
        }}
      >
        <Text
          selectable
          style={{ color: ink, fontSize: 18, lineHeight: 22, fontWeight: "700" }}
        >
          Member email
        </Text>

        <Text
          selectable
          style={{ color: muted, fontSize: 14, lineHeight: 18, fontWeight: "500" }}
        >
          Enter the email address of a Tabbit user to add them to this group.
        </Text>

        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="friend@example.com"
          placeholderTextColor="#A2ABBC"
          selectionColor={accent}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoFocus
          style={{
            borderRadius: 14,
            borderCurve: "continuous",
            borderWidth: 1,
            borderColor: stroke,
            backgroundColor: "#FAFBFD",
            paddingHorizontal: 14,
            paddingVertical: 12,
            color: ink,
            fontSize: 16,
            lineHeight: 20,
            fontWeight: "600",
          }}
        />
      </View>

      {formError ? (
        <View
          style={{
            borderRadius: 14,
            borderCurve: "continuous",
            borderWidth: 1,
            borderColor: "#F5D1D1",
            backgroundColor: "#FFF6F6",
            padding: 12,
          }}
        >
          <Text
            selectable
            style={{ color: "#B03030", fontSize: 14, lineHeight: 18, fontWeight: "600" }}
          >
            {formError}
          </Text>
        </View>
      ) : null}

      <Pressable
        accessibilityRole="button"
        disabled={isAddingMember}
        onPress={handleAdd}
        style={{
          borderRadius: 16,
          borderCurve: "continuous",
          backgroundColor: isAddingMember ? "#9A8CFF" : accent,
          paddingVertical: 14,
          alignItems: "center",
          justifyContent: "center",
          opacity: isAddingMember ? 0.8 : 1,
        }}
      >
        <Text
          selectable
          style={{
            color: "#FFFFFF",
            fontSize: 16,
            lineHeight: 20,
            fontWeight: "700",
          }}
        >
          {isAddingMember ? "Adding..." : "Add Member"}
        </Text>
      </Pressable>
    </ScrollView>
  );
}
