import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";

import { colorSemanticTokens } from "@/design/tokens/colors";
import { useAuth } from "@/features/auth/state/auth-provider";
import { useFriendDetail } from "@/features/friends/hooks/use-friend-detail";
import { createSettlement } from "@/features/groups/lib/expenses-repository";
import { formatCents } from "@/features/groups/lib/format-currency";

const surface = colorSemanticTokens.surface.cardStrong;
const stroke = colorSemanticTokens.border.subtle;
const ink = colorSemanticTokens.text.primary;
const muted = colorSemanticTokens.text.secondary;
const accent = colorSemanticTokens.accent.primary;

type FriendGroupOption = {
  id: string;
  name: string;
  emoji: string | null;
};

function getTodayString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function FriendSettleUpScreen() {
  const { friendId } = useLocalSearchParams<{ friendId: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { friend, activity, isLoading, error, refresh } =
    useFriendDetail(friendId);

  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [amountText, setAmountText] = useState("");
  const [dateText, setDateText] = useState(getTodayString());
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const maxAmountCents = friend ? Math.abs(friend.netCents) : 0;

  const groupOptions = useMemo<FriendGroupOption[]>(() => {
    const groupMap = new Map<string, FriendGroupOption>();

    for (const item of activity) {
      if (!groupMap.has(item.groupId)) {
        groupMap.set(item.groupId, {
          id: item.groupId,
          name: item.groupName,
          emoji: item.groupEmoji,
        });
      }
    }

    return Array.from(groupMap.values());
  }, [activity]);

  useEffect(() => {
    if (groupOptions.length === 0) {
      setSelectedGroupId(null);
      return;
    }

    setSelectedGroupId((currentValue) => {
      if (
        currentValue &&
        groupOptions.some((group) => group.id === currentValue)
      ) {
        return currentValue;
      }

      return groupOptions[0].id;
    });
  }, [groupOptions]);

  useEffect(() => {
    if (!friend || maxAmountCents <= 0) {
      setAmountText("");
      return;
    }

    setAmountText((maxAmountCents / 100).toFixed(2));
  }, [friend, maxAmountCents]);

  const isYouOwe = friend?.direction === "you_owe";

  const payerId = friend && user ? (isYouOwe ? user.id : friend.userId) : null;
  const payeeId = friend && user ? (isYouOwe ? friend.userId : user.id) : null;

  const friendLabel = friend?.displayName ?? friend?.email ?? "Friend";
  const payerLabel = payerId === user?.id ? "You" : friendLabel;
  const payeeLabel = payeeId === user?.id ? "You" : friendLabel;

  const handleSubmit = () => {
    if (!user?.id) {
      setFormError("Sign in to record a settlement.");
      return;
    }

    if (!friend) {
      setFormError("Friend details are still loading.");
      return;
    }

    if (friend.direction === "settled") {
      setFormError("This balance is already settled.");
      return;
    }

    if (!selectedGroupId) {
      setFormError("Pick a shared group to record this settlement.");
      return;
    }

    const parsedAmount = Number.parseFloat(amountText);
    const amountCents = Math.round(parsedAmount * 100);

    if (!Number.isFinite(parsedAmount) || amountCents <= 0) {
      setFormError("Enter a valid amount greater than $0.00.");
      return;
    }

    if (amountCents > maxAmountCents) {
      setFormError(
        `Amount cannot exceed ${formatCents(maxAmountCents)} for this settlement.`,
      );
      return;
    }

    if (!dateText.match(/^\d{4}-\d{2}-\d{2}$/)) {
      setFormError("Enter a valid date in YYYY-MM-DD format.");
      return;
    }

    if (!payerId || !payeeId || payerId === payeeId) {
      setFormError("Settlement direction is invalid.");
      return;
    }

    setFormError(null);
    setIsSubmitting(true);

    void (async () => {
      const result = await createSettlement({
        groupId: selectedGroupId,
        amountCents,
        expenseDate: dateText,
        paidBy: payerId,
        paidTo: payeeId,
        createdBy: user.id,
      });

      setIsSubmitting(false);

      if (!result.ok) {
        setFormError(result.message);
        return;
      }

      router.back();
    })();
  };

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 24,
        gap: 12,
      }}
    >
      {isLoading ? (
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
            style={{
              color: ink,
              fontSize: 18,
              lineHeight: 22,
              fontWeight: "700",
            }}
          >
            Loading settlement details...
          </Text>
        </View>
      ) : null}

      {error ? (
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
              color: ink,
              fontSize: 18,
              lineHeight: 22,
              fontWeight: "700",
            }}
          >
            Could not load friend details
          </Text>
          <Text
            selectable
            style={{
              color: muted,
              fontSize: 14,
              lineHeight: 18,
              fontWeight: "500",
            }}
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
              borderColor: colorSemanticTokens.border.muted,
              paddingHorizontal: 12,
              paddingVertical: 8,
              backgroundColor: colorSemanticTokens.background.subtle,
            }}
          >
            <Text
              selectable
              style={{
                color: ink,
                fontSize: 13,
                lineHeight: 16,
                fontWeight: "700",
              }}
            >
              Try again
            </Text>
          </Pressable>
        </View>
      ) : null}

      {friend ? (
        <>
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
              style={{
                color: muted,
                fontSize: 14,
                lineHeight: 18,
                fontWeight: "600",
              }}
            >
              Settling with {friendLabel}
            </Text>
            <Text
              selectable
              style={{
                color: friend.direction === "you_are_owed" ? accent : ink,
                fontSize: 24,
                lineHeight: 30,
                fontWeight: "700",
                fontVariant: ["tabular-nums"],
              }}
            >
              {formatCents(maxAmountCents)}
            </Text>
            <Text
              selectable
              style={{
                color: muted,
                fontSize: 14,
                lineHeight: 18,
                fontWeight: "500",
              }}
            >
              {isYouOwe ? "You owe this friend" : "This friend owes you"}
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
              gap: 10,
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
              Shared group
            </Text>
            {groupOptions.length === 0 ? (
              <Text
                selectable
                style={{
                  color: muted,
                  fontSize: 14,
                  lineHeight: 18,
                  fontWeight: "500",
                }}
              >
                No shared group found in recent activity.
              </Text>
            ) : (
              <View style={{ gap: 8 }}>
                {groupOptions.map((group) => {
                  const isSelected = selectedGroupId === group.id;

                  return (
                    <Pressable
                      key={group.id}
                      onPress={() => {
                        setSelectedGroupId(group.id);
                      }}
                      style={{
                        borderRadius: 14,
                        borderCurve: "continuous",
                        borderWidth: 1,
                        borderColor: isSelected ? "rgba(50, 87, 226, 0.24)" : stroke,
                        backgroundColor: isSelected ? colorSemanticTokens.accent.soft : colorSemanticTokens.surface.cardStrong,
                        paddingHorizontal: 12,
                        paddingVertical: 10,
                      }}
                    >
                      <Text
                        selectable
                        style={{
                          color: isSelected ? accent : ink,
                          fontSize: 16,
                          lineHeight: 20,
                          fontWeight: "600",
                        }}
                      >
                        {group.emoji ? `${group.emoji} ` : ""}
                        {group.name}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
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
              gap: 8,
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
              Direction
            </Text>
            <Text
              selectable
              style={{
                color: muted,
                fontSize: 14,
                lineHeight: 18,
                fontWeight: "500",
              }}
            >
              Payer: {payerLabel}
            </Text>
            <Text
              selectable
              style={{
                color: muted,
                fontSize: 14,
                lineHeight: 18,
                fontWeight: "500",
              }}
            >
              Payee: {payeeLabel}
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
              gap: 10,
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
              Amount
            </Text>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                borderRadius: 14,
                borderCurve: "continuous",
                borderWidth: 1,
                borderColor: stroke,
                backgroundColor: colorSemanticTokens.surface.cardMuted,
                paddingHorizontal: 14,
              }}
            >
              <Text
                selectable
                style={{
                  color: muted,
                  fontSize: 20,
                  lineHeight: 24,
                  fontWeight: "700",
                }}
              >
                $
              </Text>
              <TextInput
                value={amountText}
                onChangeText={setAmountText}
                keyboardType="decimal-pad"
                placeholder="0.00"
                placeholderTextColor={colorSemanticTokens.text.tertiary}
                selectionColor={accent}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  paddingHorizontal: 6,
                  color: ink,
                  fontSize: 20,
                  lineHeight: 24,
                  fontWeight: "700",
                }}
              />
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
              Maximum allowed: {formatCents(maxAmountCents)}
            </Text>

            <Text
              selectable
              style={{
                color: ink,
                fontSize: 18,
                lineHeight: 22,
                fontWeight: "700",
                marginTop: 6,
              }}
            >
              Date
            </Text>
            <TextInput
              value={dateText}
              onChangeText={setDateText}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colorSemanticTokens.text.tertiary}
              selectionColor={accent}
              style={{
                borderRadius: 14,
                borderCurve: "continuous",
                borderWidth: 1,
                borderColor: stroke,
                backgroundColor: colorSemanticTokens.surface.cardMuted,
                paddingHorizontal: 14,
                paddingVertical: 12,
                color: ink,
                fontSize: 16,
                lineHeight: 20,
                fontWeight: "600",
              }}
            />
          </View>
        </>
      ) : null}

      {formError ? (
        <View
          style={{
            borderRadius: 14,
            borderCurve: "continuous",
            borderWidth: 1,
            borderColor: "rgba(188, 43, 62, 0.24)",
            backgroundColor: colorSemanticTokens.state.dangerSoft,
            padding: 12,
          }}
        >
          <Text
            selectable
            style={{
              color: colorSemanticTokens.state.danger,
              fontSize: 14,
              lineHeight: 18,
              fontWeight: "600",
            }}
          >
            {formError}
          </Text>
        </View>
      ) : null}

      <Pressable
        accessibilityRole="button"
        disabled={isSubmitting || !friend || !user || groupOptions.length === 0}
        onPress={handleSubmit}
        style={{
          borderRadius: 16,
          borderCurve: "continuous",
          backgroundColor:
            isSubmitting || !friend || !user || groupOptions.length === 0
              ? colorSemanticTokens.accent.softStrong
              : accent,
          paddingVertical: 14,
          alignItems: "center",
          justifyContent: "center",
          opacity:
            isSubmitting || !friend || !user || groupOptions.length === 0
              ? 0.8
              : 1,
        }}
      >
        <Text
          selectable
          style={{
            color: colorSemanticTokens.text.inverse,
            fontSize: 16,
            lineHeight: 20,
            fontWeight: "700",
          }}
        >
          {isSubmitting ? "Recording..." : "Record Settlement"}
        </Text>
      </Pressable>
    </ScrollView>
  );
}
