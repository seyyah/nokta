export type RoutePath = "/" | "/reports" | "/forge";

export type ScreenKey = "capture" | "reports" | "forge";

export interface NoktaScreenModel {
  key: ScreenKey;
  path: RoutePath;
  auditName: string;
  title: string;
  kicker: string;
  summary: string;
  primaryAction: string;
  status: string;
  blocks: Array<{
    label: string;
    value: string;
  }>;
}

export const TABS: Array<{ path: RoutePath; label: string }> = [
  { path: "/", label: "Capture" },
  { path: "/reports", label: "Reports" },
  { path: "/forge", label: "Forge" },
];

export const SCREENS: Record<ScreenKey, NoktaScreenModel> = {
  capture: {
    key: "capture",
    path: "/",
    auditName: "Capture",
    title: "Capture",
    kicker: "Dot intake",
    summary:
      "A small capture surface for turning a raw spark into a named idea without adding workflow weight.",
    primaryAction: "Capture spark",
    status: "Ready for audit",
    blocks: [
      { label: "Spark", value: "rural drone delivery" },
      { label: "Maturity", value: "Dot to line" },
      { label: "Risk", value: "CTA affordance must stay visible above the audit FAB." },
    ],
  },
  reports: {
    key: "reports",
    path: "/reports",
    auditName: "Reports",
    title: "Reports",
    kicker: "Export queue",
    summary:
      "A compact report list showing what a tester would export for a coding agent repair loop.",
    primaryAction: "Export report",
    status: "3 open notes",
    blocks: [
      { label: "Latest", value: "capture-cta.md" },
      { label: "Format", value: "Markdown with burn-in screenshot" },
      { label: "Risk", value: "Export action should read as primary without extra explanation." },
    ],
  },
  forge: {
    key: "forge",
    path: "/forge",
    auditName: "Forge",
    title: "Forge",
    kicker: "Ratchet ledger",
    summary:
      "A visible loop ledger for READ, LOCATE, HYPOTHESIZE, REPAIR, TEST, VERIFY and COMMIT.",
    primaryAction: "Run cycle",
    status: "kg increasing",
    blocks: [
      { label: "Last success", value: "forge-ratchet.md" },
      { label: "Guardrail", value: "One report, one hypothesis, one small diff." },
      { label: "Risk", value: "Rollback must stay visible, not hidden from the ledger." },
    ],
  },
};

export function screenKeyFromPath(pathname: string): ScreenKey {
  if (pathname === "/reports") {
    return "reports";
  }

  if (pathname === "/forge") {
    return "forge";
  }

  return "capture";
}
