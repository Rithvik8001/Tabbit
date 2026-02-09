import { Link, useRouter } from "expo-router";
import { Pressable, Text, View } from "@/design/primitives/sora-native";
import { useState } from "react";

import { Button } from "@/design/primitives/button";
import { FloatingAddExpenseCta } from "@/design/primitives/floating-add-expense-cta";
import { ScreenContainer } from "@/design/primitives/screen-container";
import { TabTopActions } from "@/design/primitives/tab-top-actions";
import { colorSemanticTokens } from "@/design/tokens/colors";
import { radiusTokens } from "@/design/tokens/radius";
import { spacingTokens } from "@/design/tokens/spacing";
import { typographyScale } from "@/design/tokens/typography";
import { useAuth } from "@/features/auth/state/auth-provider";
import { useProfile } from "@/features/profile/hooks/use-profile";

function AccountRow({
  label,
  subtitle,
  disabled = false,
}: {
  label: string;
  subtitle?: string;
  disabled?: boolean;
}) {
  return (
    <View
      style={{
        borderRadius: radiusTokens.card,
        borderCurve: "continuous",
        borderWidth: 1,
        borderColor: colorSemanticTokens.border.subtle,
        backgroundColor: colorSemanticTokens.surface.card,
        paddingHorizontal: spacingTokens.md,
        paddingVertical: spacingTokens.sm,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <View style={{ flex: 1, gap: 2 }}>
        <Text
          selectable
          style={[typographyScale.headingMd, { color: colorSemanticTokens.text.primary }]}
        >
          {label}
        </Text>
        {subtitle ? (
          <Text
            selectable
            style={[typographyScale.bodySm, { color: colorSemanticTokens.text.secondary }]}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>
      <Text
        selectable
        style={[typographyScale.headingSm, { color: colorSemanticTokens.text.tertiary }]}
      >
        ›
      </Text>
    </View>
  );
}

export default function SettingsTabScreen() {
  const router = useRouter();
  const { signOut, user } = useAuth();
  const { profile } = useProfile();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState<string | null>(null);

  const displayName =
    profile?.displayName ?? user?.email?.split("@")[0] ?? "Account";
  const email = profile?.email ?? user?.email ?? "-";

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
    <View style={{ flex: 1 }}>
      <ScreenContainer
        contentContainerStyle={{
          gap: spacingTokens.md,
          paddingBottom: spacingTokens["6xl"] + 120,
        }}
      >
        <TabTopActions onSearchPress={() => {}} />

        <View
          style={{
            borderRadius: radiusTokens.card,
            borderCurve: "continuous",
            borderWidth: 1,
            borderColor: colorSemanticTokens.border.subtle,
            backgroundColor: colorSemanticTokens.surface.card,
            padding: spacingTokens.cardPadding,
            flexDirection: "row",
            alignItems: "center",
            gap: spacingTokens.md,
          }}
        >
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: radiusTokens.pill,
              borderCurve: "continuous",
              backgroundColor: colorSemanticTokens.accent.soft,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text
              selectable
              style={[typographyScale.headingLg, { color: colorSemanticTokens.accent.primary }]}
            >
              {displayName.trim().slice(0, 1).toUpperCase()}
            </Text>
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <Text
              selectable
              style={[typographyScale.headingLg, { color: colorSemanticTokens.text.primary }]}
            >
              {displayName}
            </Text>
            <Text
              selectable
              style={[typographyScale.bodyMd, { color: colorSemanticTokens.text.secondary }]}
            >
              {email}
            </Text>
          </View>
          <Link href="/(app)/(tabs)/(settings)/profile" asChild>
            <Pressable>
              <Text
                selectable
                style={[typographyScale.headingSm, { color: colorSemanticTokens.accent.primary }]}
              >
                Edit
              </Text>
            </Pressable>
          </Link>
        </View>

        <View style={{ gap: spacingTokens.sm }}>
          <Link href="/(app)/(tabs)/(settings)/profile" asChild>
            <Pressable>
              <AccountRow label="Profile" subtitle="Username and account details" />
            </Pressable>
          </Link>

          <Link href="/(app)/(tabs)/(settings)/notifications" asChild>
            <Pressable>
              <AccountRow label="Notifications" subtitle="Email updates and alerts" />
            </Pressable>
          </Link>

          <AccountRow
            label="Scan code"
            subtitle="Coming soon"
            disabled
          />

          <AccountRow
            label="Bank connections"
            subtitle="Coming soon"
            disabled
          />
        </View>

        {signOutError ? (
          <Text
            selectable
            style={[typographyScale.bodySm, { color: colorSemanticTokens.state.danger }]}
          >
            {signOutError}
          </Text>
        ) : null}

        <Button
          label="Sign out"
          loading={isSigningOut}
          onPress={handleSignOut}
          tone="danger"
        />
      </ScreenContainer>

      <FloatingAddExpenseCta
        onPress={() => {
          router.push("/(app)/add-expense-context");
        }}
      />
    </View>
  );
}
