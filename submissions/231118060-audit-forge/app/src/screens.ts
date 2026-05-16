export type ScreenKey = "capture" | "reports" | "forge";

export type ScreenMetric = {
  label: string;
  value: string;
};

export type ScreenAction = {
  title: string;
  detail: string;
};

export type ScreenData = {
  key: ScreenKey;
  route: "/" | "/reports" | "/forge";
  label: string;
  eyebrow: string;
  title: string;
  summary: string;
  metrics: ScreenMetric[];
  actions: ScreenAction[];
  accent: string;
};

export const screens: ScreenData[] = [
  {
    key: "capture",
    route: "/",
    label: "Capture",
    eyebrow: "Phase A",
    title: "Yakalama masasi",
    summary:
      "Tester tek ekranda akisi baslatir: gor, isaretle, notu yaz, raporu disari al. Audit FAB her route ustunde ayni host sinirindan calisir.",
    metrics: [
      { label: "tap", value: "1" },
      { label: "bounds", value: "tek kutu" },
      { label: "data", value: "mock" }
    ],
    actions: [
      {
        title: "CTA yakinligi",
        detail: "Birincil butonun alt boslugunu ve dokunma alanini dogrula."
      },
      {
        title: "Burn-in kaydi",
        detail: "Sari kutu rapor gorselinin parcasi olarak saklanir."
      }
    ],
    accent: "#b42318"
  },
  {
    key: "reports",
    route: "/reports",
    label: "Reports",
    eyebrow: "Artifact",
    title: "Rapor panosu",
    summary:
      "Markdown ve Word ciktilari ayni not havuzundan beslenir. Host depolama karari uygulama tarafinda kalir, widget sadece deps sozlesmesini okur.",
    metrics: [
      { label: "open", value: "3" },
      { label: "fixed", value: "0" },
      { label: "format", value: "md/docx" }
    ],
    actions: [
      {
        title: "Export okunurlugu",
        detail: "Agent input bolumu insan notundan ayrilir."
      },
      {
        title: "Share sheet",
        detail: "Dosya disari sadece host paylasim kanaliyla cikar."
      }
    ],
    accent: "#175cd3"
  },
  {
    key: "forge",
    route: "/forge",
    label: "Forge",
    eyebrow: "Phase B",
    title: "Ratchet ledger",
    summary:
      "Her cycle tek hipotez, tek degisiklik ve tek test kanitiyla ilerler. Basarisiz hipotezler silinmez; sonraki cycle icin hafiza olur.",
    metrics: [
      { label: "success", value: "3" },
      { label: "rollback", value: "1" },
      { label: "kg", value: "24" }
    ],
    actions: [
      {
        title: "Minimal fix",
        detail: "Rapor intenti disina tasan refactor yok."
      },
      {
        title: "Verify",
        detail: "Typecheck ve expo install check ratchet kapisi olur."
      }
    ],
    accent: "#027a48"
  }
];

export const getScreen = (key: ScreenKey) => {
  const screen = screens.find((item) => item.key === key);

  if (!screen) {
    throw new Error(`Unknown screen key: ${key}`);
  }

  return screen;
};
