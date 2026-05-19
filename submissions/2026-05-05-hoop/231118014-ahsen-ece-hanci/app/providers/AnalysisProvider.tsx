import createContextHook from "@nkzw/create-context-hook";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { generateObject } from "@rork-ai/toolkit-sdk";

import type { Analysis, AnalysisTone } from "@/types/analysis";

const STORAGE_KEY = "nokta.analyses.v1";
const TONE_KEY = "nokta.tone.v1";

const dimSchema = z.object({
  key: z.enum(["market", "competitors", "evidence", "novelty", "feasibility"]),
  label: z.string(),
  score: z.number().min(0).max(100),
  note: z.string(),
});

const analysisSchema = z.object({
  score: z.number().min(0).max(100).describe("Slop score. 0 = sharp, grounded, verifiable. 100 = pure slop, buzzword salad, unverifiable."),
  verdict: z.string().describe("One-line verdict in plain English, max 120 chars."),
  summary: z.string().describe("2-3 sentence investor-style summary of why this pitch scored what it did."),
  dimensions: z.array(dimSchema).length(5),
  redFlags: z
    .array(
      z.object({
        title: z.string(),
        quote: z.string().describe("Short direct quote or paraphrase from the pitch that triggered this flag."),
        explanation: z.string(),
        severity: z.enum(["low", "medium", "high"]),
      }),
    )
    .max(8),
  claimsToVerify: z
    .array(
      z.object({
        claim: z.string(),
        why: z.string().describe("What specific evidence would prove or disprove this claim."),
      }),
    )
    .max(6),
  rewrite: z.string().describe("A grounded, slop-free rewrite of the pitch in plain investor English. No buzzwords. Only concrete, verifiable statements. If something wasn't in the original, mark it as [TBD]."),
});

function systemPrompt(tone: AnalysisTone): string {
  const toneLine = {
    standard: "Be direct, analytical, fair.",
    brutal: "Be brutal, merciless, and sharp. Call out every weak word. You are a top-tier VC partner who has seen 10,000 decks.",
    merciful: "Be constructive and kind, but still honest. Help the founder improve.",
  }[tone];
  return `You are Nokta, a senior VC partner doing instant due-diligence on a founder's pitch.
Your job is to detect "slop" — vague claims, buzzword stacks, unverifiable numbers, TAM inflation, competitor blindness, and AI-generated platitudes.

${toneLine}

Scoring rubric (slop score, 0-100, HIGHER = MORE SLOP):
- 0-19 SHARP: concrete numbers, specific wedge, honest about weaknesses
- 20-39 GROUNDED: mostly specific, small hype
- 40-59 MIXED: some signal, significant hand-waving
- 60-79 SLOPPY: mostly buzzwords, weak evidence
- 80-100 PURE SLOP: AI-generated-looking, no specifics, fake-sounding TAM

Dimensions (each 0-100, HIGHER = MORE SLOP):
- market: TAM/market size claims — are they inflated, generic, or grounded?
- competitors: Does the founder show awareness of real competitors, or claim "no competition"?
- evidence: Revenue, users, retention, specific numbers vs. vague "significant traction"
- novelty: Is the "unique insight" actually unique, or standard AI app slop?
- feasibility: Is the go-to-market realistic, or magical thinking?

Red flags examples: "revolutionary", "disrupt", "10x", unqualified TAM figures, "Fortune 500 are desperate", "no competition", "viral growth" as GTM, buzzword stacking (AI + blockchain + web3), round sizes at huge valuations with no traction.

Rewrite rules: keep ONLY what's verifiable in the original. Replace every vague claim with [TBD] in square brackets. Use plain investor English. No adjectives like "revolutionary" or "cutting-edge". Numbers only if original had them.`;
}

export const [AnalysisProvider, useAnalysisContext] = createContextHook(() => {
  const qc = useQueryClient();
  const [tone, setToneState] = useState<AnalysisTone>("standard");

  const analysesQuery = useQuery<Analysis[]>({
    queryKey: ["analyses"],
    queryFn: async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw) as Analysis[];
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        console.log("[Nokta] load error", e);
        return [];
      }
    },
  });

  useEffect(() => {
    (async () => {
      try {
        const t = await AsyncStorage.getItem(TONE_KEY);
        if (t === "standard" || t === "brutal" || t === "merciful") setToneState(t);
      } catch (e) {
        console.log("[Nokta] tone load error", e);
      }
    })();
  }, []);

  const analyses = useMemo(() => analysesQuery.data ?? [], [analysesQuery.data]);

  const persistMutation = useMutation({
    mutationFn: async (next: Analysis[]) => {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    },
    onSuccess: (next) => {
      qc.setQueryData(["analyses"], next);
    },
  });

  const analyzeMutation = useMutation({
    mutationFn: async (input: { pitch: string; tone: AnalysisTone }): Promise<Analysis> => {
      console.log("[Nokta] analyze start", { len: input.pitch.length, tone: input.tone });
      const result = await generateObject({
        messages: [
          { role: "user", content: `${systemPrompt(input.tone)}\n\n---\nPITCH TO ANALYZE:\n"""\n${input.pitch}\n"""\n\nReturn ONLY the structured analysis.` },
        ],
        schema: analysisSchema,
      });
      const analysis: Analysis = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        createdAt: Date.now(),
        pitch: input.pitch,
        tone: input.tone,
        score: Math.round(result.score),
        verdict: result.verdict,
        summary: result.summary,
        dimensions: result.dimensions.map((d) => ({ ...d, score: Math.round(d.score) })),
        redFlags: result.redFlags,
        claimsToVerify: result.claimsToVerify,
        rewrite: result.rewrite,
      };
      console.log("[Nokta] analyze done", { score: analysis.score });
      return analysis;
    },
  });

  const saveAnalysis = useCallback(
    async (a: Analysis) => {
      const next = [a, ...analyses.filter((x) => x.id !== a.id)];
      await persistMutation.mutateAsync(next);
    },
    [analyses, persistMutation],
  );

  const deleteAnalysis = useCallback(
    async (id: string) => {
      const next = analyses.filter((x) => x.id !== id);
      await persistMutation.mutateAsync(next);
    },
    [analyses, persistMutation],
  );

  const clearAll = useCallback(async () => {
    await persistMutation.mutateAsync([]);
  }, [persistMutation]);

  const setTone = useCallback(async (t: AnalysisTone) => {
    setToneState(t);
    try {
      await AsyncStorage.setItem(TONE_KEY, t);
    } catch (e) {
      console.log("[Nokta] tone save error", e);
    }
  }, []);

  return {
    analyses,
    isLoading: analysesQuery.isLoading,
    analyzeMutation,
    saveAnalysis,
    deleteAnalysis,
    clearAll,
    tone,
    setTone,
  };
});

export function useAnalysisById(id: string | undefined): Analysis | undefined {
  const { analyses } = useAnalysisContext();
  return useMemo(() => (id ? analyses.find((a) => a.id === id) : undefined), [analyses, id]);
}
