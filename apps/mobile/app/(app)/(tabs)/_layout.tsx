import { Icon, Label, NativeTabs } from "expo-router/unstable-native-tabs";
import * as Haptics from "expo-haptics";
import { useSegments } from "expo-router";
import { useEffect, useRef } from "react";

import { colorSemanticTokens } from "@/design/tokens/colors";

const tabTint = colorSemanticTokens.accent.primary;

function getActiveTabSegment(segments: string[]): string | null {
  const tabsIndex = segments.indexOf("(tabs)");
  if (tabsIndex === -1) {
    return null;
  }

  return segments[tabsIndex + 1] ?? null;
}

export default function AppTabsLayout() {
  const segments = useSegments();
  const previousTabSegment = useRef<string | null>(null);
  const activeTabSegment = getActiveTabSegment(segments);

  useEffect(() => {
    if (!activeTabSegment) {
      return;
    }

    if (!previousTabSegment.current) {
      previousTabSegment.current = activeTabSegment;
      return;
    }

    if (previousTabSegment.current === activeTabSegment) {
      return;
    }

    previousTabSegment.current = activeTabSegment;

    if (process.env.EXPO_OS === "ios") {
      void Haptics.selectionAsync();
    }
  }, [activeTabSegment]);

  return (
    <NativeTabs
      tintColor={tabTint}
      backgroundColor={colorSemanticTokens.background.chrome}
      labelStyle={{ fontSize: 11, fontWeight: "500", fontFamily: "Sora_500Medium" }}
    >
      <NativeTabs.Trigger name="(home)">
        <Label>Home</Label>
        <Icon sf={{ default: "house", selected: "house.fill" }} />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="(groups)">
        <Label>Groups</Label>
        <Icon sf={{ default: "person.3", selected: "person.3.fill" }} />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="(friends)">
        <Label>Friends</Label>
        <Icon sf={{ default: "person.2", selected: "person.2.fill" }} />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="(receipts)">
        <Label>Receipts</Label>
        <Icon
          sf={{
            default: "doc.text.viewfinder",
            selected: "doc.text.viewfinder",
          }}
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="(settings)">
        <Label>Settings</Label>
        <Icon sf={{ default: "gearshape", selected: "gearshape.fill" }} />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
