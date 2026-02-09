import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Switch, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { Button } from "@/design/primitives/button";
import { LiquidSurface } from "@/design/primitives/liquid-surface";
import { ScreenContainer } from "@/design/primitives/screen-container";
import { TextField } from "@/design/primitives/text-field";
import { colorSemanticTokens } from "@/design/tokens/colors";
import { spacingTokens } from "@/design/tokens/spacing";
import { typographyScale } from "@/design/tokens/typography";
import { useAuth } from "@/features/auth/state/auth-provider";
import { getDisplayNameValidationMessage } from "@/features/auth/utils/auth-validation";
import { useNotificationPreferences } from "@/features/notifications/hooks/use-notification-preferences";
import { useProfile } from "@/features/profile/hooks/use-profile";

function settingRow(
  label: string,
  value: boolean,
  onValueChange: (nextValue: boolean) => void,
) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: spacingTokens.sm,
      }}
    >
      <Text selectable style={[typographyScale.bodyLg, { color: colorSemanticTokens.text.primary }]}>
        {label}
      </Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ true: colorSemanticTokens.accent.primary }}
      />
    </View>
  );
}

export default function SettingsTabScreen() {
  const router = useRouter();
  const { signOut, user } = useAuth();
  const { profile, isLoading, isSaving, error, saveDisplayName } = useProfile();
  const {
    preferences,
    isLoading: isLoadingPrefs,
    error: prefsError,
    toggleFriendRequests,
    toggleGroupInvitations,
    toggleExpenseUpdates,
  } = useNotificationPreferences();

  const [isSigningOut, setIsSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState<string | null>(null);
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

  const handleSignOut = () => {
    setSignOutError(null);
    setIsSigningOut(true);

    void (async () => {
      const result = await signOut();
      setIsSigningOut(false);

      if (!result.ok) {
        setSignOutError(result.message ?? "Unable to sign out right now.");
        return;
      }

      router.replace("/(onboarding)");
    })();
  };

  return (
    <ScreenContainer contentContainerStyle={{ gap: spacingTokens.md }}>
      <LiquidSurface kind="strong" contentStyle={{ padding: spacingTokens.cardPadding, gap: spacingTokens.sm }}>
        <Text selectable style={[typographyScale.labelMd, { color: colorSemanticTokens.text.tertiary }]}>
          Account
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

        <Text selectable style={[typographyScale.bodyMd, { color: colorSemanticTokens.text.secondary }]}>
          {profileEmail}
        </Text>
        <Text selectable style={[typographyScale.bodySm, { color: colorSemanticTokens.text.tertiary }]}>
          Sign-in method: {providerLabel}
        </Text>

        {error ? (
          <Text selectable style={[typographyScale.bodySm, { color: colorSemanticTokens.state.danger }]}>
            {error}
          </Text>
        ) : null}

        <Button
          label={isSaving ? "Saving..." : "Save Username"}
          loading={isSaving}
          onPress={handleSaveProfile}
          disabled={
            isLoading ||
            isSaving ||
            !hasPendingDisplayNameChange ||
            Boolean(displayNameValidationMessage)
          }
        />
      </LiquidSurface>

      <LiquidSurface contentStyle={{ padding: spacingTokens.cardPadding, gap: spacingTokens.md }}>
        <Text selectable style={[typographyScale.headingSm, { color: colorSemanticTokens.text.primary }]}>
          Email Notifications
        </Text>
        {isLoadingPrefs ? (
          <ActivityIndicator size="small" color={colorSemanticTokens.accent.primary} />
        ) : (
          <>
            {settingRow(
              "Friend requests",
              preferences?.friend_request_received ?? true,
              toggleFriendRequests,
            )}
            {settingRow(
              "Group invitations",
              preferences?.added_to_group ?? true,
              toggleGroupInvitations,
            )}
            {settingRow(
              "Expense & settlement updates",
              preferences?.new_expense ?? true,
              toggleExpenseUpdates,
            )}
            {prefsError ? (
              <Text selectable style={[typographyScale.bodySm, { color: colorSemanticTokens.state.danger }]}>
                {prefsError}
              </Text>
            ) : null}
          </>
        )}
      </LiquidSurface>

      {signOutError ? (
        <Text selectable style={[typographyScale.bodySm, { color: colorSemanticTokens.state.danger, textAlign: "center" }]}>
          {signOutError}
        </Text>
      ) : null}

      <Button
        label="Sign Out"
        loading={isSigningOut}
        onPress={handleSignOut}
        tone="danger"
        variant="solid"
        size="lg"
      />
    </ScreenContainer>
  );
}
