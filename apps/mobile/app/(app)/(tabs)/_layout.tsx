import { Icon, Label, NativeTabs } from "expo-router/unstable-native-tabs";

const tabTint = "#4A29FF";

export default function AppTabsLayout() {
  return (
    <NativeTabs tintColor={tabTint}>
      <NativeTabs.Trigger name="(home)">
        <Label>Home</Label>
        <Icon sf={{ default: "house", selected: "house.fill" }} />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="(groups)">
        <Label>Groups</Label>
        <Icon sf={{ default: "person.3", selected: "person.3.fill" }} />
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
