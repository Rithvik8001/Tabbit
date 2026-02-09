import { Redirect } from "expo-router";

export default function HomeCompatibilityRedirect() {
  return <Redirect href="/(app)/(tabs)/(activity)" />;
}
