import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from "@/design/primitives/sora-native";

import { Button } from "@/design/primitives/button";
import { useThemeColors } from "@/providers/theme-provider";
import { radiusTokens } from "@/design/tokens/radius";
import { spacingTokens } from "@/design/tokens/spacing";
import { typographyScale } from "@/design/tokens/typography";
import { useAuth } from "@/features/auth/state/auth-provider";
import { useGroupDetail } from "@/features/groups/hooks/use-group-detail";
import { getGroupMemberLabel } from "@/features/shared/lib/person-label";

export default function GroupSettingsScreen() {
  const colors = useThemeColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const {
    group,
    members,
    isLoading,
    error,
    refresh,
    removeMember,
    deleteGroup,
    isDeleting,
  } = useGroupDetail(id);

  const isAdmin = members.some(
    (member) => member.userId === user?.id && member.role === "admin",
  );

  const handleDeleteGroup = () => {
    Alert.alert(
      "Delete Group",
      "Are you sure you want to delete this group? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            void (async () => {
              const result = await deleteGroup();
              if (result.ok) {
                router.back();
                router.back();
                return;
              }

              Alert.alert("Error", result.message);
            })();
          },
        },
      ],
    );
  };

  const handleRemoveMember = (memberId: string, memberName: string) => {
    Alert.alert("Remove Member", `Remove ${memberName} from this group?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => {
          void (async () => {
            const result = await removeMember(memberId);
            if (!result.ok) {
              Alert.alert("Error", result.message);
            }
          })();
        },
      },
    ]);
  };

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingHorizontal: spacingTokens.xl,
        paddingTop: spacingTokens.sm,
        paddingBottom: spacingTokens["4xl"],
        gap: spacingTokens.md,
      }}
    >
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
              { color: colors.text.secondary },
            ]}
          >
            Back
          </Text>
        </Pressable>

        <Text
          selectable
          style={[
            typographyScale.headingLg,
            { color: colors.text.primary },
          ]}
        >
          Group settings
        </Text>

        <View style={{ width: 36 }} />
      </View>

      {isLoading ? (
        <Text
          selectable
          style={[
            typographyScale.bodyMd,
            { color: colors.text.secondary },
          ]}
        >
          Loading settings...
        </Text>
      ) : null}

      {error ? (
        <View
          style={{
            borderRadius: radiusTokens.card,
            borderCurve: "continuous",
            borderWidth: 1,
            borderColor: colors.state.danger,
            backgroundColor: colors.state.dangerSoft,
            padding: spacingTokens.md,
            gap: spacingTokens.sm,
          }}
        >
          <Text
            selectable
            style={[
              typographyScale.headingSm,
              { color: colors.state.danger },
            ]}
          >
            
            {error}
          </Text>
          <Pressable onPress={() => void refresh()}>
            
            <Text
              selectable
              style={[
                typographyScale.headingSm,
                { color: colors.accent.primary },
              ]}
            >
              
              Retry
            </Text>
          </Pressable>
        </View>
      ) : null}

      {!isLoading && !error && group ? (
        <>
          <View
            style={{
              borderRadius: radiusTokens.card,
              borderCurve: "continuous",
              borderWidth: 1,
              borderColor: colors.border.subtle,
              backgroundColor: colors.surface.card,
              padding: spacingTokens.cardPadding,
              gap: spacingTokens.sm,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: spacingTokens.sm,
              }}
            >
              
              <Text selectable style={{ fontSize: 30, lineHeight: 36 }}>
                
                {group.emoji}
              </Text>
              <View style={{ flex: 1, gap: 2 }}>
                
                <Text
                  selectable
                  style={[
                    typographyScale.headingLg,
                    { color: colors.text.primary },
                  ]}
                >
                  {group.name}
                </Text>
                <Text
                  selectable
                  style={[
                    typographyScale.bodySm,
                    { color: colors.text.secondary },
                  ]}
                >
                  {members.length} {members.length === 1 ? "member" : "members"}
                </Text>
              </View>
              {isAdmin ? (
                <Pressable
                  onPress={() => {
                    router.push({
                      pathname: "/(app)/(tabs)/(groups)/edit",
                      params: { id: group.id },
                    });
                  }}
                >
                  <Text
                    selectable
                    style={[
                      typographyScale.headingSm,
                      { color: colors.accent.primary },
                    ]}
                  >
                    Edit
                  </Text>
                </Pressable>
              ) : null}
            </View>
          </View>

          <View style={{ gap: spacingTokens.sm }}>
            
            <Text
              selectable
              style={[
                typographyScale.headingMd,
                { color: colors.text.primary },
              ]}
            >
              Group members
            </Text>
            {isAdmin ? (
              <Button
                label="Add people to group"
                variant="soft"
                onPress={() => {
                  router.push({
                    pathname: "/(app)/(tabs)/(groups)/add-member",
                    params: { id: group.id },
                  });
                }}
              />
            ) : null}
            {members.map((member) => {
              const label = getGroupMemberLabel({
                displayName: member.displayName,
                email: member.email,
              });
              const isSelf = member.userId === user?.id;

              return (
                <View
                  key={member.id}
                  style={{
                    borderRadius: radiusTokens.card,
                    borderCurve: "continuous",
                    borderWidth: 1,
                    borderColor: colors.border.subtle,
                    backgroundColor: colors.surface.card,
                    padding: spacingTokens.md,
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: spacingTokens.sm,
                  }}
                >
                  <View style={{ flex: 1, gap: 2 }}>
                    
                    <Text
                      selectable
                      style={[
                        typographyScale.headingMd,
                        { color: colors.text.primary },
                      ]}
                    >
                      {label}
                      {isSelf ? " (you)" : ""}
                    </Text>
                    {member.email ? (
                      <Text
                        selectable
                        style={[
                          typographyScale.bodySm,
                          { color: colors.text.secondary },
                        ]}
                      >
                        {member.email}
                      </Text>
                    ) : null}
                  </View>

                  {isAdmin && !isSelf ? (
                    <Pressable
                      onPress={() => handleRemoveMember(member.id, label)}
                    >
                      <Text
                        selectable
                        style={[
                          typographyScale.headingSm,
                          { color: colors.state.danger },
                        ]}
                      >
                        Remove
                      </Text>
                    </Pressable>
                  ) : null}
                </View>
              );
            })}
          </View>

          {isAdmin ? (
            <Button
              label={isDeleting ? "Deleting..." : "Delete group"}
              loading={isDeleting}
              disabled={isDeleting}
              onPress={handleDeleteGroup}
              tone="danger"
              variant="soft"
            />
          ) : null}
        </>
      ) : null}
    </ScrollView>
  );
}
