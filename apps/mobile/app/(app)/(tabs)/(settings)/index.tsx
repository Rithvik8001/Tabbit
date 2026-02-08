import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, Switch, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";

import { useAuth } from "@/features/auth/state/auth-provider";
import { getDisplayNameValidationMessage } from "@/features/auth/utils/auth-validation";
import { useProfile } from "@/features/profile/hooks/use-profile";

const surface = "#FFFFFF";
const stroke = "#E8ECF2";
const ink = "#0F172A";
const muted = "#5C6780";
const accent = "#4A29FF";

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
        gap: 12,
      }}
    >
      <Text
        selectable
        style={{ color: ink, fontSize: 16, lineHeight: 20, fontWeight: "600" }}
      >
        {label}
      </Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ true: accent }}
      />
    </View>
  );
}

export default function SettingsTabScreen() {
  const router = useRouter();
  const { signOut, user } = useAuth();
  const { profile, isLoading, isSaving, error, saveDisplayName } = useProfile();

  const [isSigningOut, setIsSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [draftDisplayName, setDraftDisplayName] = useState("");

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [smartRemindersEnabled, setSmartRemindersEnabled] = useState(false);

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
        return;
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
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingHorizontal: 20,
        paddingBottom: 24,
        gap: 14,
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
          style={{
            color: muted,
            fontSize: 14,
            lineHeight: 18,
            fontWeight: "600",
          }}
        >
          Account
        </Text>

        <View style={{ gap: 8 }}>
          <Text
            selectable
            style={{
              color: ink,
              fontSize: 14,
              lineHeight: 18,
              fontWeight: "700",
            }}
          >
            Username *
          </Text>
          <TextInput
            value={draftDisplayName}
            onChangeText={setDraftDisplayName}
            placeholder="Choose a username"
            placeholderTextColor="#A2ABBC"
            selectionColor={accent}
            autoCapitalize="words"
            autoCorrect={false}
            style={{
              borderRadius: 14,
              borderCurve: "continuous",
              borderWidth: 1,
              borderColor: displayNameValidationMessage ? "#E8B8B8" : stroke,
              backgroundColor: "#FAFBFD",
              paddingHorizontal: 14,
              paddingVertical: 12,
              color: ink,
              fontSize: 16,
              lineHeight: 20,
              fontWeight: "600",
            }}
          />
          <Text
            selectable
            style={{
              color: muted,
              fontSize: 13,
              lineHeight: 16,
              fontWeight: "500",
            }}
          >
            Required
          </Text>
        </View>

        <Text
          selectable
          style={{
            color: muted,
            fontSize: 15,
            lineHeight: 20,
            fontWeight: "500",
          }}
        >
          {profileEmail}
        </Text>
        <Text
          selectable
          style={{
            color: muted,
            fontSize: 15,
            lineHeight: 20,
            fontWeight: "500",
          }}
        >
          Sign-in method: {providerLabel}
        </Text>

        {error ? (
          <Text
            selectable
            style={{
              color: "#B03030",
              fontSize: 14,
              lineHeight: 18,
              fontWeight: "600",
            }}
          >
            {error}
          </Text>
        ) : null}

        {profileError ? (
          <Text
            selectable
            style={{
              color: "#B03030",
              fontSize: 14,
              lineHeight: 18,
              fontWeight: "600",
            }}
          >
            {profileError}
          </Text>
        ) : null}

        <Pressable
          onPress={handleSaveProfile}
          disabled={
            isLoading ||
            isSaving ||
            !hasPendingDisplayNameChange ||
            Boolean(displayNameValidationMessage)
          }
          style={{
            marginTop: 4,
            borderRadius: 14,
            borderCurve: "continuous",
            backgroundColor: accent,
            height: 46,
            alignItems: "center",
            justifyContent: "center",
            opacity:
              isLoading ||
              isSaving ||
              !hasPendingDisplayNameChange ||
              Boolean(displayNameValidationMessage)
                ? 0.6
                : 1,
          }}
        >
          <Text
            selectable
            style={{
              color: "#FFFFFF",
              fontSize: 15,
              lineHeight: 18,
              fontWeight: "700",
            }}
          >
            {isSaving ? "Saving..." : "Save Username"}
          </Text>
        </Pressable>
      </View>

      <View
        style={{
          borderRadius: 20,
          borderCurve: "continuous",
          borderWidth: 1,
          borderColor: stroke,
          backgroundColor: surface,
          padding: 16,
          gap: 14,
        }}
      >
        <Text
          selectable
          style={{
            color: ink,
            fontSize: 18,
            lineHeight: 22,
            fontWeight: "700",
          }}
        >
          Preferences
        </Text>
        {settingRow(
          "Payment reminders",
          notificationsEnabled,
          setNotificationsEnabled,
        )}
        {settingRow(
          "Smart split suggestions",
          smartRemindersEnabled,
          setSmartRemindersEnabled,
        )}
      </View>

      <View
        style={{
          borderRadius: 20,
          borderCurve: "continuous",
          borderWidth: 1,
          borderColor: stroke,
          backgroundColor: surface,
          padding: 16,
          gap: 12,
        }}
      >
        <Text
          selectable
          style={{
            color: ink,
            fontSize: 18,
            lineHeight: 22,
            fontWeight: "700",
          }}
        >
          Sign Out
        </Text>

        {signOutError ? (
          <Text
            selectable
            style={{
              color: "#B03030",
              fontSize: 14,
              lineHeight: 18,
              fontWeight: "600",
            }}
          >
            {signOutError}
          </Text>
        ) : null}

        <Pressable
          onPress={handleSignOut}
          disabled={isSigningOut}
          style={{
            borderRadius: 16,
            borderCurve: "continuous",
            backgroundColor: accent,
            height: 54,
            alignItems: "center",
            justifyContent: "center",
            opacity: isSigningOut ? 0.65 : 1,
          }}
        >
          <Text
            selectable
            style={{
              color: "#FFFFFF",
              fontSize: 17,
              lineHeight: 20,
              fontWeight: "700",
            }}
          >
            Sign Out & Restart Onboarding
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
