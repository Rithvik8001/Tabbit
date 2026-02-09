import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Alert, Pressable, ScrollView, Text, TextInput, View } from "react-native";

import { colorSemanticTokens } from "@/design/tokens/colors";
import { useAuth } from "@/features/auth/state/auth-provider";
import { formatCents } from "@/features/groups/lib/format-currency";
import { useGroupDetail } from "@/features/groups/hooks/use-group-detail";
import { useGroupExpenses } from "@/features/groups/hooks/use-group-expenses";
import type { SplitType, ExpenseSplitInput } from "@/features/groups/types/expense.types";

const stroke = colorSemanticTokens.border.subtle;
const ink = colorSemanticTokens.text.primary;
const muted = colorSemanticTokens.text.secondary;
const accent = colorSemanticTokens.accent.primary;
const maxDescriptionLength = 100;

const SPLIT_TYPE_OPTIONS: { type: SplitType; label: string; subtitle: string }[] = [
  { type: "equal", label: "Equal", subtitle: "Split evenly among participants" },
  { type: "exact", label: "Exact", subtitle: "Specify each person's share" },
  { type: "percent", label: "Percent", subtitle: "Split by percentage" },
];

function getTodayString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function AddExpenseScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { group, members } = useGroupDetail(id);
  const { createExpense, isCreating } = useGroupExpenses(id, members);

  const [description, setDescription] = useState("");
  const [amountText, setAmountText] = useState("");
  const [dateText, setDateText] = useState(getTodayString());
  const [splitType, setSplitType] = useState<SplitType>("equal");
  const [paidBy, setPaidBy] = useState<string | null>(null);
  const [selectedParticipants, setSelectedParticipants] = useState<Set<string>>(new Set());
  const [exactAmounts, setExactAmounts] = useState<Record<string, string>>({});
  const [percentAmounts, setPercentAmounts] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const seededGroupIdRef = useRef<string | null>(null);

  useEffect(() => {
    seededGroupIdRef.current = null;
    setPaidBy(null);
    setSelectedParticipants(new Set());
    setExactAmounts({});
    setPercentAmounts({});
    setFormError(null);
  }, [id]);

  useEffect(() => {
    if (!id || !group || group.id !== id || members.length === 0) {
      return;
    }

    if (seededGroupIdRef.current === id) {
      return;
    }

    const memberUserIds = members.map((member) => member.userId);
    const fallbackPaidBy = members[0]?.userId ?? null;
    const initialPaidBy =
      user?.id && memberUserIds.includes(user.id) ? user.id : fallbackPaidBy;

    if (!initialPaidBy) {
      return;
    }

    setPaidBy((currentValue) => currentValue ?? initialPaidBy);
    setSelectedParticipants((currentValue) =>
      currentValue.size > 0 ? currentValue : new Set(memberUserIds),
    );
    seededGroupIdRef.current = id;
  }, [group, id, members, user?.id]);

  const amountCents = Math.round(parseFloat(amountText || "0") * 100);
  const participantIds = Array.from(selectedParticipants);
  const participantCount = participantIds.length;

  const toggleParticipant = (userId: string) => {
    setSelectedParticipants((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });
  };

  const computeEqualSplits = (): ExpenseSplitInput[] => {
    if (participantCount === 0) return [];
    const perPerson = Math.floor(amountCents / participantCount);
    const remainder = amountCents - perPerson * participantCount;

    return participantIds.map((userId, i) => ({
      userId,
      shareCents: perPerson + (i < remainder ? 1 : 0),
    }));
  };

  const computeExactSplits = (): ExpenseSplitInput[] => {
    return participantIds.map((userId) => ({
      userId,
      shareCents: Math.round(parseFloat(exactAmounts[userId] || "0") * 100),
    }));
  };

  const computePercentSplits = (): ExpenseSplitInput[] => {
    return participantIds.map((userId) => {
      const pct = parseFloat(percentAmounts[userId] || "0");
      return {
        userId,
        shareCents: Math.round((amountCents * pct) / 100),
        percentShare: pct,
      };
    });
  };

  const handleCreate = () => {
    const trimmedDesc = description.trim();

    if (trimmedDesc.length === 0) {
      setFormError("Description is required.");
      return;
    }
    if (trimmedDesc.length > maxDescriptionLength) {
      setFormError("Description can be at most 100 characters.");
      return;
    }
    if (amountCents <= 0 || isNaN(parseFloat(amountText))) {
      setFormError("Enter a valid amount greater than $0.");
      return;
    }
    if (!paidBy) {
      setFormError("Select who paid.");
      return;
    }
    if (participantCount < 2) {
      setFormError("Select at least 2 participants.");
      return;
    }

    let participants: ExpenseSplitInput[];

    if (splitType === "equal") {
      participants = computeEqualSplits();
    } else if (splitType === "exact") {
      participants = computeExactSplits();
      const sum = participants.reduce((s, p) => s + p.shareCents, 0);
      if (sum !== amountCents) {
        setFormError(`Exact amounts must add up to ${formatCents(amountCents)}. Currently ${formatCents(sum)}.`);
        return;
      }
    } else {
      participants = computePercentSplits();
      const pctSum = participantIds.reduce(
        (s, uid) => s + parseFloat(percentAmounts[uid] || "0"),
        0,
      );
      if (Math.abs(pctSum - 100) > 0.01) {
        setFormError(`Percentages must add up to 100%. Currently ${pctSum.toFixed(1)}%.`);
        return;
      }
    }

    if (!dateText.match(/^\d{4}-\d{2}-\d{2}$/)) {
      setFormError("Enter a valid date in YYYY-MM-DD format.");
      return;
    }

    const parsedDate = new Date(dateText + "T00:00:00");
    if (isNaN(parsedDate.getTime())) {
      setFormError("That date doesn't exist. Check the month and day.");
      return;
    }

    setFormError(null);

    void (async () => {
      const result = await createExpense({
        description: trimmedDesc,
        amountCents,
        expenseDate: dateText,
        splitType,
        paidBy,
        participants,
      });

      if (!result.ok) {
        Alert.alert("Error", result.message);
        return;
      }

      router.back();
    })();
  };

  // Equal split preview
  const equalPreview = splitType === "equal" && amountCents > 0 && participantCount >= 2
    ? `${formatCents(Math.floor(amountCents / participantCount))} each`
    : null;

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
      {/* Description */}
      <View
        style={{
          borderRadius: 16,
          borderCurve: "continuous",
          borderWidth: 2,
          borderColor: "#E5E5E5",
          backgroundColor: "#FFFFFF",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          padding: 16,
          gap: 10,
        }}
      >
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
            style={{ color: ink, fontSize: 18, lineHeight: 22, fontWeight: "700" }}
          >
            Description
          </Text>
          <Text
            selectable
            style={{ color: muted, fontSize: 13, lineHeight: 16, fontWeight: "600" }}
          >
            {description.trim().length}/{maxDescriptionLength}
          </Text>
        </View>

        <TextInput
          value={description}
          onChangeText={setDescription}
          maxLength={maxDescriptionLength}
          placeholder="e.g. Dinner at Nobu"
          placeholderTextColor={colorSemanticTokens.text.tertiary}
          selectionColor={accent}
          autoFocus
          style={{
            borderRadius: 16,
            borderCurve: "continuous",
            borderWidth: 2,
            borderColor: "#E5E5E5",
            backgroundColor: "#FFFFFF",
            paddingHorizontal: 14,
            paddingVertical: 12,
            color: ink,
            fontSize: 16,
            lineHeight: 20,
            fontWeight: "600",
          }}
        />
      </View>

      {/* Amount */}
      <View
        style={{
          borderRadius: 16,
          borderCurve: "continuous",
          borderWidth: 2,
          borderColor: "#E5E5E5",
          backgroundColor: "#FFFFFF",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          padding: 16,
          gap: 10,
        }}
      >
        <Text
          selectable
          style={{ color: ink, fontSize: 18, lineHeight: 22, fontWeight: "700" }}
        >
          Amount
        </Text>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            borderRadius: 16,
            borderCurve: "continuous",
            borderWidth: 2,
            borderColor: "#E5E5E5",
            backgroundColor: "#FFFFFF",
            paddingHorizontal: 14,
          }}
        >
          <Text
            selectable
            style={{ color: muted, fontSize: 20, lineHeight: 24, fontWeight: "700" }}
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
      </View>

      {/* Date */}
      <View
        style={{
          borderRadius: 16,
          borderCurve: "continuous",
          borderWidth: 2,
          borderColor: "#E5E5E5",
          backgroundColor: "#FFFFFF",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          padding: 16,
          gap: 10,
        }}
      >
        <Text
          selectable
          style={{ color: ink, fontSize: 18, lineHeight: 22, fontWeight: "700" }}
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
            borderRadius: 16,
            borderCurve: "continuous",
            borderWidth: 2,
            borderColor: "#E5E5E5",
            backgroundColor: "#FFFFFF",
            paddingHorizontal: 14,
            paddingVertical: 12,
            color: ink,
            fontSize: 16,
            lineHeight: 20,
            fontWeight: "600",
          }}
        />
      </View>

      {/* Who paid */}
      <View
        style={{
          borderRadius: 16,
          borderCurve: "continuous",
          borderWidth: 2,
          borderColor: "#E5E5E5",
          backgroundColor: "#FFFFFF",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          padding: 16,
          gap: 10,
        }}
      >
        <Text
          selectable
          style={{ color: ink, fontSize: 18, lineHeight: 22, fontWeight: "700" }}
        >
          Who paid?
        </Text>

        <View style={{ gap: 8 }}>
          {members.map((member) => {
            const isSelected = paidBy === member.userId;
            const label = member.displayName || member.email || "Unknown";
            const isSelf = member.userId === user?.id;

            return (
              <Pressable
                key={member.userId}
                onPress={() => setPaidBy(member.userId)}
                style={{
                  borderRadius: 16,
                  borderCurve: "continuous",
                  borderWidth: 1,
                  borderColor: isSelected ? colorSemanticTokens.accent.primary : stroke,
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
                  {label}{isSelf ? " (you)" : ""}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Split type */}
      <View
        style={{
          borderRadius: 16,
          borderCurve: "continuous",
          borderWidth: 2,
          borderColor: "#E5E5E5",
          backgroundColor: "#FFFFFF",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          padding: 16,
          gap: 10,
        }}
      >
        <Text
          selectable
          style={{ color: ink, fontSize: 18, lineHeight: 22, fontWeight: "700" }}
        >
          Split type
        </Text>

        <View style={{ gap: 8 }}>
          {SPLIT_TYPE_OPTIONS.map((option) => {
            const isSelected = splitType === option.type;

            return (
              <Pressable
                key={option.type}
                onPress={() => setSplitType(option.type)}
                style={{
                  borderRadius: 16,
                  borderCurve: "continuous",
                  borderWidth: 1,
                  borderColor: isSelected ? colorSemanticTokens.accent.primary : stroke,
                  backgroundColor: isSelected ? colorSemanticTokens.accent.soft : colorSemanticTokens.surface.cardStrong,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  gap: 4,
                }}
              >
                <Text
                  selectable
                  style={{
                    color: isSelected ? accent : ink,
                    fontSize: 16,
                    lineHeight: 20,
                    fontWeight: "700",
                  }}
                >
                  {option.label}
                </Text>
                <Text
                  selectable
                  style={{
                    color: muted,
                    fontSize: 13,
                    lineHeight: 16,
                    fontWeight: "500",
                  }}
                >
                  {option.subtitle}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Participants */}
      <View
        style={{
          borderRadius: 16,
          borderCurve: "continuous",
          borderWidth: 2,
          borderColor: "#E5E5E5",
          backgroundColor: "#FFFFFF",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          padding: 16,
          gap: 10,
        }}
      >
        <Text
          selectable
          style={{ color: ink, fontSize: 18, lineHeight: 22, fontWeight: "700" }}
        >
          Participants ({participantCount})
        </Text>

        <View style={{ gap: 8 }}>
          {members.map((member) => {
            const isChecked = selectedParticipants.has(member.userId);
            const label = member.displayName || member.email || "Unknown";
            const isSelf = member.userId === user?.id;

            return (
              <View key={member.userId} style={{ gap: 6 }}>
                <Pressable
                  onPress={() => toggleParticipant(member.userId)}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    borderRadius: 16,
                    borderCurve: "continuous",
                    borderWidth: 1,
                    borderColor: isChecked ? colorSemanticTokens.accent.primary : stroke,
                    backgroundColor: isChecked ? colorSemanticTokens.accent.soft : colorSemanticTokens.surface.cardStrong,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    gap: 10,
                  }}
                >
                  <View
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 6,
                      borderCurve: "continuous",
                      borderWidth: 2,
                      borderColor: isChecked ? accent : colorSemanticTokens.border.muted,
                      backgroundColor: isChecked ? accent : "transparent",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {isChecked ? (
                      <Text
                        style={{
                          color: colorSemanticTokens.text.inverse,
                          fontSize: 13,
                          lineHeight: 15,
                          fontWeight: "800",
                        }}
                      >
                        ✓
                      </Text>
                    ) : null}
                  </View>

                  <Text
                    selectable
                    style={{
                      flex: 1,
                      color: isChecked ? accent : ink,
                      fontSize: 16,
                      lineHeight: 20,
                      fontWeight: "600",
                    }}
                  >
                    {label}{isSelf ? " (you)" : ""}
                  </Text>

                  {splitType === "equal" && isChecked && equalPreview ? (
                    <Text
                      selectable
                      style={{
                        color: muted,
                        fontSize: 14,
                        lineHeight: 18,
                        fontWeight: "600",
                        fontVariant: ["tabular-nums"],
                      }}
                    >
                      {equalPreview}
                    </Text>
                  ) : null}
                </Pressable>

                {/* Exact amount input */}
                {splitType === "exact" && isChecked ? (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginLeft: 32,
                      borderRadius: 10,
                      borderCurve: "continuous",
                      borderWidth: 1,
                      borderColor: stroke,
                      backgroundColor: colorSemanticTokens.surface.cardMuted,
                      paddingHorizontal: 10,
                    }}
                  >
                    <Text
                      selectable
                      style={{ color: muted, fontSize: 16, lineHeight: 20, fontWeight: "600" }}
                    >
                      $
                    </Text>
                    <TextInput
                      value={exactAmounts[member.userId] ?? ""}
                      onChangeText={(text) =>
                        setExactAmounts((prev) => ({ ...prev, [member.userId]: text }))
                      }
                      keyboardType="decimal-pad"
                      placeholder="0.00"
                      placeholderTextColor={colorSemanticTokens.text.tertiary}
                      selectionColor={accent}
                      style={{
                        flex: 1,
                        paddingVertical: 8,
                        paddingHorizontal: 4,
                        color: ink,
                        fontSize: 16,
                        lineHeight: 20,
                        fontWeight: "600",
                      }}
                    />
                  </View>
                ) : null}

                {/* Percent input */}
                {splitType === "percent" && isChecked ? (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginLeft: 32,
                      borderRadius: 10,
                      borderCurve: "continuous",
                      borderWidth: 1,
                      borderColor: stroke,
                      backgroundColor: colorSemanticTokens.surface.cardMuted,
                      paddingHorizontal: 10,
                    }}
                  >
                    <TextInput
                      value={percentAmounts[member.userId] ?? ""}
                      onChangeText={(text) =>
                        setPercentAmounts((prev) => ({ ...prev, [member.userId]: text }))
                      }
                      keyboardType="decimal-pad"
                      placeholder="0"
                      placeholderTextColor={colorSemanticTokens.text.tertiary}
                      selectionColor={accent}
                      style={{
                        flex: 1,
                        paddingVertical: 8,
                        paddingHorizontal: 4,
                        color: ink,
                        fontSize: 16,
                        lineHeight: 20,
                        fontWeight: "600",
                      }}
                    />
                    <Text
                      selectable
                      style={{ color: muted, fontSize: 16, lineHeight: 20, fontWeight: "600" }}
                    >
                      %
                    </Text>
                  </View>
                ) : null}
              </View>
            );
          })}
        </View>

        {/* Equal split preview */}
        {splitType === "equal" && equalPreview && amountCents > 0 ? (
          <Text
            selectable
            style={{
              color: muted,
              fontSize: 14,
              lineHeight: 18,
              fontWeight: "500",
              fontVariant: ["tabular-nums"],
            }}
          >
            Splitting {formatCents(amountCents)} equally: {equalPreview}
          </Text>
        ) : null}
      </View>

      {/* Form error */}
      {formError ? (
        <View
          style={{
            borderRadius: 16,
            borderCurve: "continuous",
            borderWidth: 1,
            borderColor: colorSemanticTokens.state.danger,
            backgroundColor: colorSemanticTokens.state.dangerSoft,
            padding: 12,
          }}
        >
          <Text
            selectable
            style={{ color: colorSemanticTokens.state.danger, fontSize: 14, lineHeight: 18, fontWeight: "600" }}
          >
            {formError}
          </Text>
        </View>
      ) : null}

      {/* Submit */}
      <Pressable
        accessibilityRole="button"
        disabled={isCreating}
        onPress={handleCreate}
        style={{
          borderRadius: 16,
          borderCurve: "continuous",
          backgroundColor: isCreating ? colorSemanticTokens.accent.softStrong : accent,
          paddingVertical: 14,
          alignItems: "center",
          justifyContent: "center",
          opacity: isCreating ? 0.8 : 1,
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
          {isCreating ? "Adding..." : "Add Expense"}
        </Text>
      </Pressable>
    </ScrollView>
  );
}
