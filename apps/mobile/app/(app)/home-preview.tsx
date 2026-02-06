import { Stack, useRouter } from "expo-router";
import { Text, View } from "react-native";
import Animated, {
  FadeInDown,
  useReducedMotion,
} from "react-native-reanimated";

import { GlassCard } from "@/design/primitives/glass-card";
import { PrimaryButton } from "@/design/primitives/primary-button";
import { ScreenScaffold } from "@/design/primitives/screen-scaffold";
import { colorTokens } from "@/design/tokens/color";
import { motionTokens } from "@/design/tokens/motion";
import { spacingTokens } from "@/design/tokens/spacing";
import { typographyTokens } from "@/design/tokens/typography";
import { useOnboardingStore } from "@/features/onboarding/state/onboarding.store";

export default function HomePreviewScreen() {
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();
  const { draft, resetDraft } = useOnboardingStore();

  const getEntering = (delay: number) => {
    if (shouldReduceMotion) {
      return undefined;
    }

    return FadeInDown.duration(motionTokens.duration.enter)
      .delay(delay)
      .springify()
      .damping(18);
  };

  return (
    <ScreenScaffold
      footer={
        <PrimaryButton
          label="Restart Onboarding"
          variant="secondary"
          onPress={() => {
            resetDraft();
            router.replace("/(onboarding)/hero");
          }}
        />
      }
    >
      <Stack.Screen options={{ title: "Preview Home" }} />

      <Animated.View
        entering={getEntering(0)}
        style={{ gap: spacingTokens.xs }}
      >
        <Text
          selectable
          style={[
            typographyTokens.label,
            { color: colorTokens.text.secondary },
          ]}
        >
          Tabbit Preview
        </Text>
        <Text
          selectable
          style={[typographyTokens.title, { color: colorTokens.text.primary }]}
        >
          Shared balances, beautifully clear.
        </Text>
      </Animated.View>

      <Animated.View entering={getEntering(90)}>
        <GlassCard
          contentStyle={{
            gap: spacingTokens.lg,
            backgroundColor: "rgba(255, 255, 255, 0.62)",
          }}
        >
          <View style={{ gap: spacingTokens.xs }}>
            <Text
              selectable
              style={[
                typographyTokens.label,
                { color: colorTokens.text.secondary },
              ]}
            >
              Total owed to you
            </Text>
            <Text
              selectable
              style={[
                typographyTokens.display,
                {
                  color: colorTokens.text.primary,
                  fontVariant: ["tabular-nums"],
                },
              ]}
            >
              $248.40
            </Text>
          </View>
          <Text
            selectable
            style={[
              typographyTokens.body,
              { color: colorTokens.text.secondary },
            ]}
          >
            Style: {draft.splitStyle ?? "not set"} • Context:{" "}
            {draft.useContext ?? "not set"}
          </Text>
        </GlassCard>
      </Animated.View>

      <Animated.View entering={getEntering(150)}>
        <GlassCard
          contentStyle={{
            gap: spacingTokens.md,
            backgroundColor: "rgba(255, 255, 255, 0.58)",
          }}
        >
          <Text
            selectable
            style={[
              typographyTokens.label,
              { color: colorTokens.text.primary },
            ]}
          >
            People you split with
          </Text>
          <View style={{ gap: spacingTokens.sm }}>
            {["Aria owes $22.50", "Noah owes $8.20", "Maya owes $17.10"].map(
              (row) => {
                return (
                  <View
                    key={row}
                    style={{
                      borderRadius: 12,
                      borderCurve: "continuous",
                      backgroundColor: "rgba(255, 255, 255, 0.72)",
                      borderWidth: 1,
                      borderColor: colorTokens.border.subtle,
                      paddingHorizontal: spacingTokens.md,
                      paddingVertical: spacingTokens.sm,
                    }}
                  >
                    <Text
                      selectable
                      style={[
                        typographyTokens.body,
                        { color: colorTokens.text.secondary },
                      ]}
                    >
                      {row}
                    </Text>
                  </View>
                );
              },
            )}
          </View>
        </GlassCard>
      </Animated.View>

      <Animated.View entering={getEntering(210)}>
        <GlassCard
          contentStyle={{
            gap: spacingTokens.md,
            backgroundColor: "rgba(255, 255, 255, 0.58)",
          }}
        >
          <Text
            selectable
            style={[
              typographyTokens.label,
              { color: colorTokens.text.primary },
            ]}
          >
            Recent activity
          </Text>
          <View style={{ gap: spacingTokens.sm }}>
            {[
              "Coffee run split equally · 4 people",
              "Groceries split by exact amounts",
              "Weekend trip hotel split by percentage",
            ].map((row) => {
              return (
                <Text
                  key={row}
                  selectable
                  style={[
                    typographyTokens.body,
                    { color: colorTokens.text.secondary },
                  ]}
                >
                  {row}
                </Text>
              );
            })}
          </View>
        </GlassCard>
      </Animated.View>
    </ScreenScaffold>
  );
}
