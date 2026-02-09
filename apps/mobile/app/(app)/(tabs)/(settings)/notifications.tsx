import { ActivityIndicator, Pressable, Switch, Text, View } from "@/design/primitives/sora-native";
import { useRouter } from "expo-router";

import { ScreenContainer } from "@/design/primitives/screen-container";
import { colorSemanticTokens } from "@/design/tokens/colors";
import { spacingTokens } from "@/design/tokens/spacing";
import { typographyScale } from "@/design/tokens/typography";
import { useNotificationPreferences } from "@/features/notifications/hooks/use-notification-preferences";

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

export default function NotificationSettingsScreen() {
  const router = useRouter();
  const {
    preferences,
    isLoading,
    error,
    toggleFriendRequests,
    toggleGroupInvitations,
    toggleExpenseUpdates,
  } = useNotificationPreferences();

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
        Notifications
      </Text>

      {isLoading ? (
        <ActivityIndicator size="small" color={colorSemanticTokens.accent.primary} />
      ) : (
        <View
          style={{
            borderRadius: 20,
            borderCurve: "continuous",
            borderWidth: 1,
            borderColor: colorSemanticTokens.border.subtle,
            backgroundColor: colorSemanticTokens.surface.card,
            padding: spacingTokens.cardPadding,
            gap: spacingTokens.md,
          }}
        >
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

          {error ? (
            <Text selectable style={[typographyScale.bodySm, { color: colorSemanticTokens.state.danger }]}>
              {error}
            </Text>
          ) : null}
        </View>
      )}
    </ScreenContainer>
  );
}
