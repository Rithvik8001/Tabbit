import { useEffect, useMemo, useState } from "react";
import { useRouter } from "expo-router";
import { Pressable, Text, View } from "@/design/primitives/sora-native";

import { Button } from "@/design/primitives/button";
import { ScreenContainer } from "@/design/primitives/screen-container";
import { TextField } from "@/design/primitives/text-field";
import { colorSemanticTokens } from "@/design/tokens/colors";
import { spacingTokens } from "@/design/tokens/spacing";
import { typographyScale } from "@/design/tokens/typography";
import { useAuth } from "@/features/auth/state/auth-provider";
import { getDisplayNameValidationMessage } from "@/features/auth/utils/auth-validation";
import { useProfile } from "@/features/profile/hooks/use-profile";

export default function ProfileSettingsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { profile, isLoading, isSaving, error, saveDisplayName } = useProfile();

  const [profileError, setProfileError] = useState<string | null>(null);
  const [draftDisplayName, setDraftDisplayName] = useState("");

  useEffect(() => {
    if (profile?.displayName) {
      setDraftDisplayName(profile.displayName);
      return;
    }

    if (user?.email) {
      setDraftDisplayName(user.email.split("@")[0] ?? "");
    }
  }, [profile?.displayName, user?.email]);

  const profileEmail = profile?.email ?? user?.email ?? "-";
  const providerLabel = useMemo(() => "Email + Password", []);

  const displayNameValidationMessage = getDisplayNameValidationMessage(draftDisplayName);
  const hasPendingDisplayNameChange =
    draftDisplayName.trim() !== (profile?.displayName ?? "").trim();

  const handleSaveProfile = () => {
    setProfileError(null);

    if (displayNameValidationMessage) {
      setProfileError(displayNameValidationMessage);
      return;
    }

    void (async () => {
      const result = await saveDisplayName(draftDisplayName);
      if (!result.ok) {
        setProfileError(result.message);
      }
    })();
  };

  return (
    <ScreenContainer contentContainerStyle={{ gap: spacingTokens.md }}>
      <View
        style={{
          minHeight: 40,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Pressable onPress={() => router.back()}>
          <Text
            selectable
            style={[
              typographyScale.headingSm,
              { color: colorSemanticTokens.text.secondary },
            ]}
          >
            Back
          </Text>
        </Pressable>
        <Pressable onPress={() => router.back()}>
          <Text
            selectable
            style={[
              typographyScale.headingSm,
              { color: colorSemanticTokens.accent.primary },
            ]}
          >
            Done
          </Text>
        </Pressable>
      </View>

      <Text
        selectable
        style={[typographyScale.displayMd, { color: colorSemanticTokens.text.primary }]}
      >
        Profile
      </Text>

      <TextField
        value={draftDisplayName}
        onChangeText={setDraftDisplayName}
        label="Username"
        required
        placeholder="Choose a username"
        autoCapitalize="words"
        autoCorrect={false}
        error={profileError ?? displayNameValidationMessage}
        helperText={!profileError && !displayNameValidationMessage ? "Required" : undefined}
      />

      <View style={{ gap: 4 }}>
        <Text selectable style={[typographyScale.bodyMd, { color: colorSemanticTokens.text.secondary }]}>
          {profileEmail}
        </Text>
        <Text selectable style={[typographyScale.bodySm, { color: colorSemanticTokens.text.tertiary }]}>
          Sign-in method: {providerLabel}
        </Text>
      </View>

      {error ? (
        <Text selectable style={[typographyScale.bodySm, { color: colorSemanticTokens.state.danger }]}>
          {error}
        </Text>
      ) : null}

      <Button
        label={isSaving ? "Saving..." : "Save username"}
        loading={isSaving}
        onPress={handleSaveProfile}
        disabled={
          isLoading ||
          isSaving ||
          !hasPendingDisplayNameChange ||
          Boolean(displayNameValidationMessage)
        }
      />
    </ScreenContainer>
  );
}
