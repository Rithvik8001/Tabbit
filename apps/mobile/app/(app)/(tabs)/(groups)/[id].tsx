import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";

import { useAuth } from "@/features/auth/state/auth-provider";
import { getGroupTypeLabel } from "@/features/groups/constants/group-presets";
import { useGroupDetail } from "@/features/groups/hooks/use-group-detail";

const surface = "#FFFFFF";
const stroke = "#E8ECF2";
const ink = "#0F172A";
const muted = "#5C6780";
const accent = "#4A29FF";

function LoadingCard() {
  return (
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
      <View
        style={{
          width: "60%",
          height: 14,
          borderRadius: 999,
          backgroundColor: "#F1F4F8",
        }}
      />
      <View
        style={{
          width: "40%",
          height: 12,
          borderRadius: 999,
          backgroundColor: "#F1F4F8",
        }}
      />
    </View>
  );
}

export default function GroupDetailScreen() {
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

  const isAdmin = group && user ? group.createdBy === user.id : false;

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
              } else {
                Alert.alert("Error", result.message);
              }
            })();
          },
        },
      ],
    );
  };

  const handleRemoveMember = (memberId: string, memberName: string) => {
    Alert.alert(
      "Remove Member",
      `Remove ${memberName} from this group?`,
      [
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
      ],
    );
  };

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 24,
        gap: 12,
      }}
    >
      <Stack.Screen
        options={{
          title: group?.name ?? "Group",
          headerLargeTitle: false,
        }}
      />

      {isLoading ? (
        <>
          <LoadingCard />
          <LoadingCard />
        </>
      ) : null}

      {!isLoading && error ? (
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
            style={{ color: ink, fontSize: 20, lineHeight: 24, fontWeight: "700" }}
          >
            Could not load group
          </Text>
          <Text
            selectable
            style={{ color: muted, fontSize: 15, lineHeight: 20, fontWeight: "500" }}
          >
            {error}
          </Text>
          <Pressable
            onPress={() => {
              void refresh();
            }}
            style={{
              alignSelf: "flex-start",
              borderRadius: 999,
              borderCurve: "continuous",
              borderWidth: 1,
              borderColor: "#D7DDE8",
              paddingHorizontal: 12,
              paddingVertical: 8,
              backgroundColor: "#F8FAFC",
            }}
          >
            <Text
              selectable
              style={{ color: ink, fontSize: 13, lineHeight: 16, fontWeight: "700" }}
            >
              Try again
            </Text>
          </Pressable>
        </View>
      ) : null}

      {!isLoading && !error && group ? (
        <>
          {/* Group info card */}
          <View
            style={{
              borderRadius: 20,
              borderCurve: "continuous",
              borderWidth: 1,
              borderColor: stroke,
              backgroundColor: surface,
              padding: 16,
              gap: 12,
              alignItems: "center",
            }}
          >
            <View
              style={{
                width: 64,
                height: 64,
                borderRadius: 999,
                borderCurve: "continuous",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#F4F2FF",
              }}
            >
              <Text selectable style={{ fontSize: 32, lineHeight: 38 }}>
                {group.emoji}
              </Text>
            </View>
            <Text
              selectable
              style={{ color: ink, fontSize: 24, lineHeight: 30, fontWeight: "700" }}
            >
              {group.name}
            </Text>
            <Text
              selectable
              style={{ color: muted, fontSize: 15, lineHeight: 20, fontWeight: "600" }}
            >
              {getGroupTypeLabel(group.groupType)} group
            </Text>
          </View>

          {/* Members card */}
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
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Text
                selectable
                style={{ color: ink, fontSize: 18, lineHeight: 22, fontWeight: "700" }}
              >
                Members ({members.length})
              </Text>
              {isAdmin ? (
                <Pressable
                  onPress={() => {
                    router.push({
                      pathname: "/(app)/(tabs)/(groups)/add-member",
                      params: { id: group.id },
                    });
                  }}
                  style={{
                    borderRadius: 999,
                    borderCurve: "continuous",
                    borderWidth: 1,
                    borderColor: "#E2DDFF",
                    backgroundColor: "#ECE9FF",
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                  }}
                >
                  <Text
                    selectable
                    style={{
                      color: accent,
                      fontSize: 13,
                      lineHeight: 16,
                      fontWeight: "700",
                    }}
                  >
                    Add
                  </Text>
                </Pressable>
              ) : null}
            </View>

            {members.length === 0 ? (
              <Text
                selectable
                style={{ color: muted, fontSize: 14, lineHeight: 18, fontWeight: "500" }}
              >
                No members yet.
              </Text>
            ) : (
              members.map((member) => {
                const label = member.displayName || member.email || "Unknown";
                const isSelf = member.userId === user?.id;

                return (
                  <View
                    key={member.id}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      borderRadius: 14,
                      borderCurve: "continuous",
                      borderWidth: 1,
                      borderColor: stroke,
                      padding: 12,
                      gap: 8,
                    }}
                  >
                    <View style={{ flex: 1, gap: 2 }}>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                        <Text
                          selectable
                          style={{
                            color: ink,
                            fontSize: 16,
                            lineHeight: 20,
                            fontWeight: "600",
                          }}
                        >
                          {label}
                          {isSelf ? " (you)" : ""}
                        </Text>
                        {member.role === "admin" ? (
                          <View
                            style={{
                              borderRadius: 999,
                              backgroundColor: "#F3F0FF",
                              paddingHorizontal: 6,
                              paddingVertical: 2,
                            }}
                          >
                            <Text
                              selectable
                              style={{
                                color: accent,
                                fontSize: 11,
                                lineHeight: 14,
                                fontWeight: "700",
                              }}
                            >
                              Admin
                            </Text>
                          </View>
                        ) : null}
                      </View>
                      {member.displayName && member.email ? (
                        <Text
                          selectable
                          style={{
                            color: muted,
                            fontSize: 13,
                            lineHeight: 16,
                            fontWeight: "500",
                          }}
                        >
                          {member.email}
                        </Text>
                      ) : null}
                    </View>

                    {isAdmin && !isSelf ? (
                      <Pressable
                        onPress={() => handleRemoveMember(member.id, label)}
                        hitSlop={8}
                        style={{
                          borderRadius: 999,
                          borderCurve: "continuous",
                          borderWidth: 1,
                          borderColor: "#F5D1D1",
                          backgroundColor: "#FFF6F6",
                          paddingHorizontal: 10,
                          paddingVertical: 4,
                        }}
                      >
                        <Text
                          selectable
                          style={{
                            color: "#B03030",
                            fontSize: 12,
                            lineHeight: 16,
                            fontWeight: "700",
                          }}
                        >
                          Remove
                        </Text>
                      </Pressable>
                    ) : null}
                  </View>
                );
              })
            )}
          </View>

          {/* No expenses yet card */}
          <View
            style={{
              borderRadius: 20,
              borderCurve: "continuous",
              borderWidth: 1,
              borderColor: stroke,
              backgroundColor: surface,
              padding: 16,
            }}
          >
            <Text
              selectable
              style={{ color: muted, fontSize: 14, lineHeight: 18, fontWeight: "500" }}
            >
              No expenses yet
            </Text>
          </View>

          {/* Admin actions */}
          {isAdmin ? (
            <View style={{ gap: 10 }}>
              <Pressable
                onPress={() => {
                  router.push({
                    pathname: "/(app)/(tabs)/(groups)/edit",
                    params: { id: group.id },
                  });
                }}
                style={{
                  borderRadius: 16,
                  borderCurve: "continuous",
                  backgroundColor: accent,
                  paddingVertical: 14,
                  alignItems: "center",
                  justifyContent: "center",
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
                  Edit Group
                </Text>
              </Pressable>

              <Pressable
                disabled={isDeleting}
                onPress={handleDeleteGroup}
                style={{
                  borderRadius: 16,
                  borderCurve: "continuous",
                  borderWidth: 1,
                  borderColor: "#F5D1D1",
                  backgroundColor: "#FFF6F6",
                  paddingVertical: 14,
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: isDeleting ? 0.6 : 1,
                }}
              >
                <Text
                  selectable
                  style={{
                    color: "#B03030",
                    fontSize: 16,
                    lineHeight: 20,
                    fontWeight: "700",
                  }}
                >
                  {isDeleting ? "Deleting..." : "Delete Group"}
                </Text>
              </Pressable>
            </View>
          ) : null}
        </>
      ) : null}
    </ScrollView>
  );
}
