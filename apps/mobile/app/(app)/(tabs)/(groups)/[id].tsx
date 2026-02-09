import { useLocalSearchParams, useRouter } from "expo-router";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";

import { Button } from "@/design/primitives/button";
import {
  HeaderPillButton,
  PageHeading,
} from "@/design/primitives/page-heading";
import { colorSemanticTokens } from "@/design/tokens/colors";
import { radiusTokens } from "@/design/tokens/radius";
import { useAuth } from "@/features/auth/state/auth-provider";
import { getGroupTypeLabel } from "@/features/groups/constants/group-presets";
import { formatCents } from "@/features/groups/lib/format-currency";
import { useGroupDetail } from "@/features/groups/hooks/use-group-detail";
import { useGroupExpenses } from "@/features/groups/hooks/use-group-expenses";

const surface = colorSemanticTokens.surface.cardStrong;
const ink = colorSemanticTokens.text.primary;
const muted = colorSemanticTokens.text.secondary;
const accent = colorSemanticTokens.accent.primary;

function LoadingCard() {
  return (
    <View
      style={{
        borderRadius: radiusTokens.card,
        borderCurve: "continuous",
        backgroundColor: colorSemanticTokens.surface.card,
        padding: 16,
        gap: 10,
      }}
    >
      <View
        style={{
          width: "60%",
          height: 14,
          borderRadius: 999,
          backgroundColor: colorSemanticTokens.background.subtle,
        }}
      />
      <View
        style={{
          width: "40%",
          height: 12,
          borderRadius: 999,
          backgroundColor: colorSemanticTokens.background.subtle,
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

  const {
    expenses,
    userBalance,
    simplifiedDebts,
    deleteExpense,
  } = useGroupExpenses(id, members);

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

  const handleDeleteExpense = (expenseId: string, description: string) => {
    Alert.alert(
      "Delete Expense",
      `Delete "${description}"? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            void (async () => {
              const result = await deleteExpense(expenseId);
              if (!result.ok) {
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
      <PageHeading
        size="section"
        title={group?.name ?? "Group"}
        subtitle={
          group
            ? `${members.length} ${members.length === 1 ? "member" : "members"}`
            : "Review members, balances, and expenses."
        }
        leading={
          <HeaderPillButton label="Back" onPress={() => router.back()} />
        }
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
            borderRadius: radiusTokens.card,
            borderCurve: "continuous",
            backgroundColor: surface,
            padding: 16,
            gap: 10,
          }}
        >
          <Text
            selectable
            style={{ color: ink, fontSize: 20, lineHeight: 24, fontWeight: "600" }}
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
              paddingHorizontal: 12,
              paddingVertical: 8,
              backgroundColor: colorSemanticTokens.background.subtle,
            }}
          >
            <Text
              selectable
              style={{ color: ink, fontSize: 13, lineHeight: 16, fontWeight: "600" }}
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
              borderRadius: radiusTokens.card,
              borderCurve: "continuous",
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
                backgroundColor: colorSemanticTokens.accent.soft,
              }}
            >
              <Text selectable style={{ fontSize: 32, lineHeight: 38 }}>
                {group.emoji}
              </Text>
            </View>
            <Text
              selectable
              style={{ color: ink, fontSize: 24, lineHeight: 30, fontWeight: "600" }}
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
              borderRadius: radiusTokens.card,
              borderCurve: "continuous",
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
                style={{ color: ink, fontSize: 18, lineHeight: 22, fontWeight: "600" }}
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
                    backgroundColor: colorSemanticTokens.accent.soft,
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
                      fontWeight: "600",
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
                      borderRadius: radiusTokens.card,
                      borderCurve: "continuous",
                      backgroundColor: colorSemanticTokens.background.subtle,
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
                              backgroundColor: colorSemanticTokens.accent.soft,
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
                                fontWeight: "600",
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
                          backgroundColor: colorSemanticTokens.state.dangerSoft,
                          paddingHorizontal: 10,
                          paddingVertical: 4,
                        }}
                      >
                        <Text
                          selectable
                          style={{
                            color: colorSemanticTokens.state.danger,
                            fontSize: 12,
                            lineHeight: 16,
                            fontWeight: "600",
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

          {/* Balance summary card */}
          {expenses.length > 0 ? (
            <View
              style={{
                borderRadius: radiusTokens.card,
                borderCurve: "continuous",
                backgroundColor: surface,
                padding: 16,
                gap: 12,
              }}
            >
              <Text
                selectable
                style={{ color: ink, fontSize: 18, lineHeight: 22, fontWeight: "600" }}
              >
                Your Balance
              </Text>
              <Text
                selectable
                style={{
                  color:
                    userBalance.direction === "you_are_owed"
                      ? colorSemanticTokens.financial.positive
                      : userBalance.direction === "you_owe"
                        ? colorSemanticTokens.financial.negative
                        : muted,
                  fontSize: 28,
                  lineHeight: 34,
                  fontWeight: "600",
                  fontVariant: ["tabular-nums"],
                }}
              >
                {userBalance.direction === "you_are_owed"
                  ? `+${formatCents(userBalance.netCents)}`
                  : userBalance.direction === "you_owe"
                    ? formatCents(userBalance.netCents)
                    : "$0.00"}
              </Text>
              <Text
                selectable
                style={{ color: muted, fontSize: 14, lineHeight: 18, fontWeight: "500" }}
              >
                {userBalance.direction === "you_are_owed"
                  ? "You are owed"
                  : userBalance.direction === "you_owe"
                    ? "You owe"
                    : "Settled up"}
              </Text>

              {simplifiedDebts.length > 0 ? (
                <View style={{ gap: 6, marginTop: 4 }}>
                  {simplifiedDebts.map((debt, i) => {
                    const fromLabel = debt.fromUserId === user?.id ? "You" : (debt.fromName ?? "Someone");
                    const toLabel = debt.toUserId === user?.id ? "you" : (debt.toName ?? "someone");
                    const settleActionLabel =
                      debt.fromUserId === user?.id
                        ? "I Paid"
                        : debt.toUserId === user?.id
                          ? "They Paid Me"
                          : null;

                    return (
                      <View
                        key={`debt-${i}`}
                        style={{
                          borderRadius: 10,
                          borderCurve: "continuous",
                          backgroundColor: colorSemanticTokens.background.subtle,
                          paddingHorizontal: 10,
                          paddingVertical: 8,
                        }}
                      >
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 10,
                          }}
                        >
                          <Text
                            selectable
                            style={{
                              flex: 1,
                              color: ink,
                              fontSize: 14,
                              lineHeight: 18,
                              fontWeight: "500",
                              fontVariant: ["tabular-nums"],
                            }}
                          >
                            {fromLabel} {debt.fromUserId === user?.id ? "owe" : "owes"} {toLabel} {formatCents(debt.amountCents)}
                          </Text>
                          {settleActionLabel ? (
                            <Pressable
                              onPress={() => {
                                router.push({
                                  pathname: "/(app)/(tabs)/(groups)/settle-up" as never,
                                  params: {
                                    id: group.id,
                                    fromUserId: debt.fromUserId,
                                    toUserId: debt.toUserId,
                                    maxAmountCents: String(debt.amountCents),
                                  } as never,
                                });
                              }}
                              style={{
                                borderRadius: 999,
                                borderCurve: "continuous",
                                backgroundColor: colorSemanticTokens.accent.soft,
                                paddingHorizontal: 10,
                                paddingVertical: 4,
                              }}
                            >
                              <Text
                                selectable
                                style={{
                                  color: accent,
                                  fontSize: 12,
                                  lineHeight: 16,
                                  fontWeight: "600",
                                }}
                              >
                                {settleActionLabel}
                              </Text>
                            </Pressable>
                          ) : null}
                        </View>
                      </View>
                    );
                  })}
                </View>
              ) : null}
            </View>
          ) : null}

          {/* Expenses card */}
          <View
            style={{
              borderRadius: radiusTokens.card,
              borderCurve: "continuous",
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
                style={{ color: ink, fontSize: 18, lineHeight: 22, fontWeight: "600" }}
              >
                Expenses{expenses.length > 0 ? ` (${expenses.length})` : ""}
              </Text>
              <Pressable
                onPress={() => {
                  router.push({
                    pathname: "/(app)/(tabs)/(groups)/add-expense",
                    params: { id: group.id },
                  });
                }}
                style={{
                  borderRadius: 999,
                  borderCurve: "continuous",
                  backgroundColor: colorSemanticTokens.accent.soft,
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
                    fontWeight: "600",
                  }}
                >
                  + Add
                </Text>
              </Pressable>
            </View>

            {expenses.length === 0 ? (
              <Text
                selectable
                style={{ color: muted, fontSize: 14, lineHeight: 18, fontWeight: "500" }}
              >
                No expenses yet
              </Text>
            ) : (
              expenses.map((expense) => {
                const canDelete =
                  expense.createdBy === user?.id || isAdmin;
                const canEdit =
                  expense.createdBy === user?.id && expense.entryType !== "settlement";
                const splitLabel =
                  expense.splitType === "equal"
                    ? "equal"
                    : expense.splitType === "exact"
                      ? "exact"
                      : "percent";
                const isSettlement = expense.entryType === "settlement";

                return (
                  <View
                    key={expense.id}
                    style={{
                      borderRadius: radiusTokens.card,
                      borderCurve: "continuous",
                      backgroundColor: colorSemanticTokens.background.subtle,
                      padding: 12,
                      gap: 6,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                        gap: 8,
                      }}
                    >
                      <View style={{ flex: 1, gap: 4 }}>
                        <Text
                          selectable
                          style={{
                            color: ink,
                            fontSize: 16,
                            lineHeight: 20,
                            fontWeight: "600",
                          }}
                        >
                          {expense.description}
                        </Text>
                        {isSettlement ? (
                          <View
                            style={{
                              alignSelf: "flex-start",
                              borderRadius: 999,
                              borderCurve: "continuous",
                              backgroundColor: colorSemanticTokens.accent.soft,
                              paddingHorizontal: 8,
                              paddingVertical: 3,
                            }}
                          >
                            <Text
                              selectable
                              style={{
                                color: accent,
                                fontSize: 11,
                                lineHeight: 14,
                                fontWeight: "600",
                              }}
                            >
                              Settlement
                            </Text>
                          </View>
                        ) : null}
                      </View>
                      <Text
                        selectable
                        style={{
                          color: ink,
                          fontSize: 16,
                          lineHeight: 20,
                          fontWeight: "600",
                          fontVariant: ["tabular-nums"],
                        }}
                      >
                        {formatCents(expense.amountCents)}
                      </Text>
                    </View>

                    <Text
                      selectable
                      style={{
                        color: muted,
                        fontSize: 13,
                        lineHeight: 16,
                        fontWeight: "500",
                      }}
                    >
                      Paid by {expense.paidByName ?? "unknown"} · {expense.expenseDate} · {isSettlement ? "settlement" : splitLabel}
                    </Text>

                    {(canEdit || canDelete) ? (
                      <View
                        style={{
                          flexDirection: "row",
                          gap: 8,
                          marginTop: 2,
                        }}
                      >
                        {canEdit ? (
                          <Pressable
                            onPress={() => {
                              router.push({
                                pathname: "/(app)/(tabs)/(groups)/edit-expense",
                                params: { id: group.id, expenseId: expense.id },
                              });
                            }}
                            hitSlop={8}
                            style={{
                              borderRadius: 999,
                              borderCurve: "continuous",
                              backgroundColor: colorSemanticTokens.state.infoSoft,
                              paddingHorizontal: 10,
                              paddingVertical: 4,
                            }}
                          >
                            <Text
                              selectable
                              style={{
                                color: colorSemanticTokens.state.info,
                                fontSize: 12,
                                lineHeight: 16,
                                fontWeight: "600",
                              }}
                            >
                              Edit
                            </Text>
                          </Pressable>
                        ) : null}
                        {canDelete ? (
                          <Pressable
                            onPress={() =>
                              handleDeleteExpense(expense.id, expense.description)
                            }
                            hitSlop={8}
                            style={{
                              borderRadius: 999,
                              borderCurve: "continuous",
                              backgroundColor: colorSemanticTokens.state.dangerSoft,
                              paddingHorizontal: 10,
                              paddingVertical: 4,
                            }}
                          >
                            <Text
                              selectable
                              style={{
                                color: colorSemanticTokens.state.danger,
                                fontSize: 12,
                                lineHeight: 16,
                                fontWeight: "600",
                              }}
                            >
                              Delete
                            </Text>
                          </Pressable>
                        ) : null}
                      </View>
                    ) : null}
                  </View>
                );
              })
            )}
          </View>

          {/* Admin actions */}
          {isAdmin ? (
            <View style={{ gap: 10 }}>
              <Button
                label="Edit group"
                onPress={() => {
                  router.push({
                    pathname: "/(app)/(tabs)/(groups)/edit",
                    params: { id: group.id },
                  });
                }}
                size="lg"
              />

              <Button
                label={isDeleting ? "Deleting..." : "Delete group"}
                onPress={handleDeleteGroup}
                disabled={isDeleting}
                loading={isDeleting}
                tone="danger"
                variant="soft"
                size="lg"
              />
            </View>
          ) : null}
        </>
      ) : null}
    </ScrollView>
  );
}
