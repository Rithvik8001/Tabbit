import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";

import { Button } from "@/design/primitives/button";
import {
  HeaderPillButton,
  PageHeading,
} from "@/design/primitives/page-heading";
import { colorSemanticTokens } from "@/design/tokens/colors";
import { radiusTokens } from "@/design/tokens/radius";
import { useAuth } from "@/features/auth/state/auth-provider";
import { useDirectFriendGroup } from "@/features/friends/hooks/use-direct-friend-group";
import { useFriendDetail } from "@/features/friends/hooks/use-friend-detail";
import { createSettlement } from "@/features/groups/lib/expenses-repository";
import { formatCents } from "@/features/groups/lib/format-currency";

const ink = colorSemanticTokens.text.primary;
const muted = colorSemanticTokens.text.secondary;
const accent = colorSemanticTokens.accent.primary;

type FriendGroupOption = {
  id: string;
  name: string;
  emoji: string | null;
  isDirect: boolean;
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
  const {
    directGroupId,
    isLoading: isDirectGroupLoading,
    error: directGroupError,
  } = useDirectFriendGroup(friendId);

  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [amountText, setAmountText] = useState("");
  const [dateText, setDateText] = useState(getTodayString());
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const maxAmountCents = friend ? Math.abs(friend.netCents) : 0;
  const friendLabel = friend?.displayName ?? friend?.email ?? "Friend";

  const groupOptions = useMemo<FriendGroupOption[]>(() => {
    const groupMap = new Map<string, FriendGroupOption>();

    for (const item of activity) {
      if (!groupMap.has(item.groupId)) {
        groupMap.set(item.groupId, {
          id: item.groupId,
          name: item.groupName,
          emoji: item.groupEmoji,
          isDirect: false,
        });
      }
    }

    const options = Array.from(groupMap.values());

    if (!directGroupId) {
      return options;
    }

    const existingDirect = groupMap.get(directGroupId);
    const directOption: FriendGroupOption = existingDirect
      ? { ...existingDirect, isDirect: true }
      : {
          id: directGroupId,
          name: `Direct with ${friendLabel}`,
          emoji: "\uD83E\uDD1D",
          isDirect: true,
        };

    return [
      directOption,
      ...options.filter((group) => group.id !== directGroupId),
    ];
  }, [activity, directGroupId, friendLabel]);

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
      setFormError("Pick a settlement group to record this settlement.");
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
      <PageHeading
        size="section"
        title="Settle Up"
        subtitle="Close your balance in one record."
        leading={
          <HeaderPillButton label="Back" onPress={() => router.back()} />
        }
      />

      {isLoading ? (
        <View
          style={{
            borderRadius: radiusTokens.card,
            borderCurve: "continuous",
            backgroundColor: colorSemanticTokens.surface.card,
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
              fontWeight: "600",
            }}
          >
            Loading settlement details...
          </Text>
        </View>
      ) : null}

      {error ? (
        <View
          style={{
            borderRadius: radiusTokens.card,
            borderCurve: "continuous",
            backgroundColor: colorSemanticTokens.surface.card,
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
              fontWeight: "600",
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
                fontWeight: "600",
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
              borderRadius: radiusTokens.card,
              borderCurve: "continuous",
              backgroundColor: colorSemanticTokens.surface.card,
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
                fontWeight: "600",
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
              borderRadius: radiusTokens.card,
              borderCurve: "continuous",
              backgroundColor: colorSemanticTokens.surface.card,
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
                fontWeight: "600",
              }}
            >
              Settlement group
            </Text>
            {isDirectGroupLoading ? (
              <Text
                selectable
                style={{
                  color: muted,
                  fontSize: 13,
                  lineHeight: 16,
                  fontWeight: "500",
                }}
              >
                Checking direct split group...
              </Text>
            ) : null}
            {directGroupError ? (
              <Text
                selectable
                style={{
                  color: colorSemanticTokens.state.danger,
                  fontSize: 13,
                  lineHeight: 16,
                  fontWeight: "600",
                }}
              >
                {directGroupError}
              </Text>
            ) : null}
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
                No available settlement group found.
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
                        borderRadius: radiusTokens.card,
                        borderCurve: "continuous",
                        borderWidth: 1.5,
                        borderColor: isSelected
                          ? colorSemanticTokens.accent.primary
                          : "transparent",
                        backgroundColor: isSelected
                          ? colorSemanticTokens.accent.soft
                          : colorSemanticTokens.background.subtle,
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
                        {group.isDirect ? " \u00B7 Direct" : ""}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            )}
          </View>

          <View
            style={{
              borderRadius: radiusTokens.card,
              borderCurve: "continuous",
              backgroundColor: colorSemanticTokens.surface.card,
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
                fontWeight: "600",
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
              borderRadius: radiusTokens.card,
              borderCurve: "continuous",
              backgroundColor: colorSemanticTokens.surface.card,
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
                fontWeight: "600",
              }}
            >
              Amount
            </Text>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                borderRadius: radiusTokens.control,
                borderCurve: "continuous",
                borderWidth: 1.5,
                borderColor: "transparent",
                backgroundColor: colorSemanticTokens.background.subtle,
                paddingHorizontal: 14,
              }}
            >
              <Text
                selectable
                style={{
                  color: muted,
                  fontSize: 20,
                  lineHeight: 24,
                  fontWeight: "600",
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
                  fontWeight: "600",
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
                fontWeight: "600",
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
                borderRadius: radiusTokens.control,
                borderCurve: "continuous",
                borderWidth: 1.5,
                borderColor: "transparent",
                backgroundColor: colorSemanticTokens.background.subtle,
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
            borderRadius: radiusTokens.card,
            borderCurve: "continuous",
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

      <Button
        label={isSubmitting ? "Recording..." : "Record settlement"}
        onPress={handleSubmit}
        loading={isSubmitting}
        disabled={
          isSubmitting ||
          !friend ||
          !user ||
          !selectedGroupId ||
          isDirectGroupLoading
        }
      />
    </ScrollView>
  );
}
