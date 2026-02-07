import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Link, Stack, useRouter } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";

import { GroupEmptyState } from "@/features/groups/components/group-empty-state";
import { getGroupTypeLabel } from "@/features/groups/constants/group-presets";
import { useGroups } from "@/features/groups/hooks/use-groups";

const surface = "#FFFFFF";
const stroke = "#E8ECF2";
const ink = "#0F172A";
const muted = "#5C6780";
const accent = "#4A29FF";

function LoadingGroupCard() {
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
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <View
          style={{
            width: 42,
            height: 42,
            borderRadius: 999,
            backgroundColor: "#F1F4F8",
          }}
        />
        <View style={{ flex: 1, gap: 8 }}>
          <View
            style={{
              width: "65%",
              height: 14,
              borderRadius: 999,
              backgroundColor: "#F1F4F8",
            }}
          />
          <View
            style={{
              width: "38%",
              height: 12,
              borderRadius: 999,
              backgroundColor: "#F1F4F8",
            }}
          />
        </View>
      </View>

      <View
        style={{
          width: "52%",
          height: 12,
          borderRadius: 999,
          backgroundColor: "#F1F4F8",
        }}
      />
    </View>
  );
}

export default function GroupsTabScreen() {
  const router = useRouter();
  const { groups, isLoading, error, refresh } = useGroups();

  const openCreateScreen = () => {
    router.push("/(app)/(tabs)/(groups)/create");
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
          headerRight: () => (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Create group"
              onPress={openCreateScreen}
              hitSlop={8}
              style={{
                width: 36,
                height: 36,
                borderRadius: 999,
                borderCurve: "continuous",
                backgroundColor: "#ECE9FF",
                borderWidth: 1,
                borderColor: "#E2DDFF",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FontAwesome name="plus" size={14} color={accent} />
            </Pressable>
          ),
        }}
      />

      {isLoading
        ? [0, 1, 2].map((index) => <LoadingGroupCard key={`group_loading_${index}`} />)
        : null}

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
            We could not load your groups
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

      {!isLoading && !error && groups.length === 0 ? (
        <GroupEmptyState onCreate={openCreateScreen} />
      ) : null}

      {!isLoading && !error
        ? groups.map((group) => (
            <Link
              key={group.id}
              href={{
                pathname: "/(app)/(tabs)/(groups)/[id]",
                params: { id: group.id },
              }}
              asChild
            >
              <Pressable
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
                <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                  <View
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 999,
                      borderCurve: "continuous",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "#F4F2FF",
                    }}
                  >
                    <Text selectable style={{ fontSize: 22, lineHeight: 26 }}>
                      {group.emoji}
                    </Text>
                  </View>
                  <View style={{ flex: 1, gap: 4 }}>
                    <Text
                      selectable
                      style={{ color: ink, fontSize: 20, lineHeight: 24, fontWeight: "700" }}
                    >
                      {group.name}
                    </Text>
                    <Text
                      selectable
                      style={{ color: muted, fontSize: 13, lineHeight: 16, fontWeight: "600" }}
                    >
                      {getGroupTypeLabel(group.groupType)} group
                    </Text>
                  </View>
                  <Text
                    selectable
                    style={{ color: muted, fontSize: 20, lineHeight: 24, fontWeight: "600" }}
                  >
                    ›
                  </Text>
                </View>

                <Text
                  selectable
                  style={{
                    color: muted,
                    fontSize: 14,
                    lineHeight: 18,
                    fontWeight: "500",
                  }}
                >
                  {group.memberCount} {group.memberCount === 1 ? "member" : "members"} ·{" "}
                  {group.expenseCount === 0
                    ? "No expenses yet"
                    : `${group.expenseCount} ${group.expenseCount === 1 ? "expense" : "expenses"}`}
                </Text>
              </Pressable>
            </Link>
          ))
        : null}
    </ScrollView>
  );
}
