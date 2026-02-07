import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";

import { useAuth } from "@/features/auth/state/auth-provider";
import { useGroupDetail } from "@/features/groups/hooks/use-group-detail";
import { createSettlement } from "@/features/groups/lib/expenses-repository";
import { formatCents } from "@/features/groups/lib/format-currency";

const surface = "#FFFFFF";
const stroke = "#E8ECF2";
const ink = "#0F172A";
const muted = "#5C6780";
const accent = "#4A29FF";

function getTodayString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getParamValue(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

export default function GroupSettleUpScreen() {
  const params = useLocalSearchParams<{
    id: string;
    fromUserId: string;
    toUserId: string;
    maxAmountCents: string;
  }>();

  const groupId = getParamValue(params.id);
  const fromUserId = getParamValue(params.fromUserId);
  const toUserId = getParamValue(params.toUserId);
  const maxAmountCentsRaw = getParamValue(params.maxAmountCents);

  const router = useRouter();
  const { user } = useAuth();
  const { group, members, isLoading, error, refresh } = useGroupDetail(
    groupId ?? undefined,
  );

  const [amountText, setAmountText] = useState("");
  const [dateText, setDateText] = useState(getTodayString());
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const maxAmountCents = useMemo(() => {
    if (!maxAmountCentsRaw) {
      return NaN;
    }

    return Number.parseInt(maxAmountCentsRaw, 10);
  }, [maxAmountCentsRaw]);

  useEffect(() => {
    if (!Number.isFinite(maxAmountCents) || maxAmountCents <= 0) {
      setAmountText("");
      return;
    }

    setAmountText((maxAmountCents / 100).toFixed(2));
  }, [maxAmountCents]);

  const fromMember = members.find((member) => member.userId === fromUserId);
  const toMember = members.find((member) => member.userId === toUserId);

  const fromLabel = fromMember?.displayName ?? fromMember?.email ?? "Unknown";
  const toLabel = toMember?.displayName ?? toMember?.email ?? "Unknown";

  const payerLabel = fromUserId === user?.id ? "You" : fromLabel;
  const payeeLabel = toUserId === user?.id ? "You" : toLabel;

  const handleSubmit = () => {
    if (!user?.id) {
      setFormError("Sign in to record a settlement.");
      return;
    }

    if (!groupId || !fromUserId || !toUserId) {
      setFormError("Settlement details are incomplete.");
      return;
    }

    if (fromUserId === toUserId) {
      setFormError("Payer and payee must be different users.");
      return;
    }

    if (!Number.isFinite(maxAmountCents) || maxAmountCents <= 0) {
      setFormError("Settlement amount limit is invalid.");
      return;
    }

    if (!fromMember || !toMember) {
      setFormError("Could not find both members in this group.");
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

    setFormError(null);
    setIsSubmitting(true);

    void (async () => {
      const result = await createSettlement({
        groupId,
        amountCents,
        expenseDate: dateText,
        paidBy: fromUserId,
        paidTo: toUserId,
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
            Could not load group details
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
              borderColor: "#D7DDE8",
              paddingHorizontal: 12,
              paddingVertical: 8,
              backgroundColor: "#F8FAFC",
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
          Group
        </Text>
        <Text
          selectable
          style={{
            color: ink,
            fontSize: 22,
            lineHeight: 28,
            fontWeight: "700",
          }}
        >
          {group?.emoji ? `${group.emoji} ` : ""}
          {group?.name ?? "Group"}
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
            backgroundColor: "#FAFBFD",
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
            placeholderTextColor="#A2ABBC"
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
          Maximum allowed:{" "}
          {Number.isFinite(maxAmountCents)
            ? formatCents(maxAmountCents)
            : "N/A"}
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
          placeholderTextColor="#A2ABBC"
          selectionColor={accent}
          style={{
            borderRadius: 14,
            borderCurve: "continuous",
            borderWidth: 1,
            borderColor: stroke,
            backgroundColor: "#FAFBFD",
            paddingHorizontal: 14,
            paddingVertical: 12,
            color: ink,
            fontSize: 16,
            lineHeight: 20,
            fontWeight: "600",
          }}
        />
      </View>

      {formError ? (
        <View
          style={{
            borderRadius: 14,
            borderCurve: "continuous",
            borderWidth: 1,
            borderColor: "#F5D1D1",
            backgroundColor: "#FFF6F6",
            padding: 12,
          }}
        >
          <Text
            selectable
            style={{
              color: "#B03030",
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
        disabled={
          isSubmitting ||
          !user ||
          !groupId ||
          !fromUserId ||
          !toUserId ||
          !Number.isFinite(maxAmountCents)
        }
        onPress={handleSubmit}
        style={{
          borderRadius: 16,
          borderCurve: "continuous",
          backgroundColor:
            isSubmitting ||
            !user ||
            !groupId ||
            !fromUserId ||
            !toUserId ||
            !Number.isFinite(maxAmountCents)
              ? "#9A8CFF"
              : accent,
          paddingVertical: 14,
          alignItems: "center",
          justifyContent: "center",
          opacity:
            isSubmitting ||
            !user ||
            !groupId ||
            !fromUserId ||
            !toUserId ||
            !Number.isFinite(maxAmountCents)
              ? 0.8
              : 1,
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
          {isSubmitting ? "Recording..." : "Record Settlement"}
        </Text>
      </Pressable>
    </ScrollView>
  );
}
