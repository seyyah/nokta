const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY?.trim();
const ENV_MODEL = import.meta.env.VITE_GEMINI_MODEL?.trim() || "gemini-1.5-flash";

export async function generateDashboardConfig(metadataPrompt, userRequest, styleModifier = "") {
  let availableModels = [ENV_MODEL];

  // 1. ADIM: Tüm Kullanılabilir Modelleri Keşfet (Orijinal Mantık)
  try {
    console.log("🔍 [AI Engine] Kullanılabilir modeller taranıyor...");
    const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`;
    const listRes = await fetch(listUrl);
    const listData = await listRes.json();

    if (listData.models && listData.models.length > 0) {
      const flashModels = listData.models.filter(m => m.name.includes("1.5-flash") && m.supportedGenerationMethods.includes("generateContent")).map(m => m.name.split('/').pop());
      const proModels = listData.models.filter(m => m.name.includes("1.5-pro") && m.supportedGenerationMethods.includes("generateContent")).map(m => m.name.split('/').pop());
      const otherModels = listData.models.filter(m => !m.name.includes("1.5") && m.supportedGenerationMethods.includes("generateContent")).map(m => m.name.split('/').pop());

      availableModels = [...new Set([ENV_MODEL, ...flashModels, ...proModels, ...otherModels])].filter(Boolean);
    }
  } catch (e) {
    console.warn("⚠️ [AI Engine] Liste alınamadı.");
  }

  const SYSTEM_PROMPT = `You are a World-Class UI/UX Designer.
MISSION: Generate a premium dashboard JSON.
PERSPECTIVE: ${styleModifier || "General overview"}

DESIGN RULES:
1. THEME: Deep dark navy (#0F172A), glassmorphism (bg-white/5 backdrop-blur-xl).
2. STYLING: Tailwind CSS classes ONLY. 
3. ICONS: Inline SVGs starting with 'M' or 'm'.
4. WIDGETS: 'dynamic_canvas' type only.

JSON FORMAT:
{
  "title": "Title",
  "subtitle": "Subtitle",
  "widgets": [
    {
      "type": "dynamic_canvas",
      "title": "Widget",
      "gridPosition": { "colSpan": 4, "rowSpan": 1, "order": 1 },
      "config": { "htmlTemplate": "HTML STRING" }
    }
  ]
}`;

  let lastError = null;

  // 2. ADIM: Survivor Mode - Modelleri Sırayla Dene
  for (const modelName of availableModels) {
    try {
      console.log(`🚀 [AI Engine] Deneniyor: ${modelName}`);
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${GEMINI_API_KEY}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${SYSTEM_PROMPT}\n\nREQUEST: ${userRequest}\n\nMETADATA:\n${metadataPrompt}` }] }],
          generationConfig: { temperature: 0.2 }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        const jsonMatch = text?.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          console.log(`✅ [AI Engine] Başarılı: ${modelName}`);
          return JSON.parse(jsonMatch[0].trim());
        }
      } else {
        const err = await response.json();
        lastError = err.error?.message || response.status;
        console.warn(`⚠️ [AI Engine] ${modelName} başarısız: ${lastError}`);
      }
    } catch (e) {
      lastError = e.message;
    }
  }

  throw new Error(`Tüm modeller meşgul: ${lastError}`);
}

export async function generateMultipleDashboardConfigs(metadataPrompt, userRequest) {
  const styles = [
    "EXECUTIVE OVERVIEW: High-level KPIs.",
    "DETAILED PERFORMANCE: Data grids and charts.",
    "VISUAL & TRENDY: Futuristic design, gradients.",
    "ACTION ORIENTED: Progress bars and alerts."
  ];

  console.log("🎨 [AI Engine] 4 farklı perspektif üretiliyor...");
  const promises = styles.map(style => generateDashboardConfig(metadataPrompt, userRequest, style));
  const results = await Promise.allSettled(promises);
  const configs = results.filter(r => r.status === 'fulfilled').map(r => r.value);

  if (configs.length === 0) throw new Error("Hiçbir dashboard üretilemedi.");
  return configs;
}
