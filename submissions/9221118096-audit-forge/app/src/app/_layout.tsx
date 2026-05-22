import { Stack, usePathname } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AuditWidget } from "@xtatistix/mobile-audit";
import { buildAuditDeps } from "@/audit/auditDeps";

// Maps the active Expo Router path to a stable, human-readable screen name.
// This is what makes the audit report's "Screen" field deterministic, which in
// turn lets the forge agent map a report straight to a source file (LOCATE).
function screenNameFromPath(path: string): string {
  if (path === "/" || path === "") return "OnboardingScreen";
  if (path.startsWith("/ideas/")) return "IdeaDetailScreen";
  if (path.startsWith("/ideas")) return "IdeaListScreen";
  if (path.startsWith("/about")) return "AboutScreen";
  return path;
}

export default function RootLayout() {
  const currentScreen = screenNameFromPath(usePathname());

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: "#0B1220" },
          headerTintColor: "#F9FAFB",
          contentStyle: { backgroundColor: "#0B1220" },
        }}
      >
        <Stack.Screen name="index" options={{ title: "Nokta" }} />
        <Stack.Screen name="ideas/index" options={{ title: "Ideas" }} />
        <Stack.Screen name="ideas/[id]" options={{ title: "Idea" }} />
        <Stack.Screen name="about" options={{ title: "About" }} />
      </Stack>

      {/* The entire audit capability is this one drop-in mount. Remove this line
          and the host app keeps working unchanged. */}
      <AuditWidget appName="Nokta" deps={buildAuditDeps(currentScreen)} initialPosition={{ bottom: 110, right: 16 }} />
    </>
  );
}
