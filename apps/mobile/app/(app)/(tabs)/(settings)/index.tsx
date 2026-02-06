import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, Switch, Text, View } from "react-native";

import { useAuth } from "@/features/auth/state/auth-provider";
import { settingsPreview } from "@/features/app-shell/mock/tab-mock-data";
import { useOnboardingStore } from "@/features/onboarding/state/onboarding.store";

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
      <Switch value={value} onValueChange={onValueChange} trackColor={{ true: accent }} />
    </View>
  );
}

export default function SettingsTabScreen() {
  const router = useRouter();
  const { signOut, user } = useAuth();
  const { resetDraft } = useOnboardingStore();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState<string | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    settingsPreview.notificationsEnabled,
  );
  const [smartRemindersEnabled, setSmartRemindersEnabled] = useState(
    settingsPreview.smartRemindersEnabled,
  );

  const profileEmail = user?.email ?? settingsPreview.email;
  const providerLabel = useMemo(() => {
    const provider = user?.app_metadata.provider ?? settingsPreview.provider;
    return provider === "google" ? "Google" : "Email + Password";
  }, [user?.app_metadata.provider]);

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

      resetDraft();
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
          gap: 8,
        }}
      >
        <Text
          selectable
          style={{ color: muted, fontSize: 14, lineHeight: 18, fontWeight: "600" }}
        >
          Account
        </Text>
        <Text
          selectable
          style={{ color: ink, fontSize: 22, lineHeight: 26, fontWeight: "700" }}
        >
          {settingsPreview.displayName}
        </Text>
        <Text
          selectable
          style={{ color: muted, fontSize: 15, lineHeight: 20, fontWeight: "500" }}
        >
          {profileEmail}
        </Text>
        <Text
          selectable
          style={{ color: muted, fontSize: 15, lineHeight: 20, fontWeight: "500" }}
        >
          Sign-in method: {providerLabel}
        </Text>
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
          style={{ color: ink, fontSize: 18, lineHeight: 22, fontWeight: "700" }}
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
          style={{ color: ink, fontSize: 18, lineHeight: 22, fontWeight: "700" }}
        >
          Session
        </Text>

        {signOutError ? (
          <Text
            selectable
            style={{ color: "#B03030", fontSize: 14, lineHeight: 18, fontWeight: "600" }}
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
            style={{ color: "#FFFFFF", fontSize: 17, lineHeight: 20, fontWeight: "700" }}
          >
            Sign Out & Restart Onboarding
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
