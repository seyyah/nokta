import createContextHook from "@nkzw/create-context-hook";
import { useCallback, useState } from "react";
import type { AuditMode, AuditReport, Annotation } from "./types";

export const [AuditProvider, useAudit] = createContextHook(() => {
  const [mode, setMode] = useState<AuditMode>("idle");
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [reports, setReports] = useState<AuditReport[]>([]);
  const [activeReport, setActiveReport] = useState<AuditReport | null>(null);

  const startCapture = useCallback(() => {
    setAnnotations([]);
    setMode("capturing");
  }, []);

  const cancelCapture = useCallback(() => {
    setAnnotations([]);
    setMode("idle");
  }, []);

  const addAnnotation = useCallback((a: Annotation) => {
    setAnnotations((prev) => [...prev, a]);
  }, []);

  const updateAnnotation = useCallback((id: string, patch: Partial<Annotation>) => {
    setAnnotations((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)));
  }, []);

  const removeAnnotation = useCallback((id: string) => {
    setAnnotations((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const saveReport = useCallback((report: AuditReport) => {
    setReports((prev) => [report, ...prev]);
    setActiveReport(report);
    setAnnotations([]);
    setMode("review");
  }, []);

  const closeReview = useCallback(() => {
    setActiveReport(null);
    setMode("idle");
  }, []);

  return {
    mode,
    setMode,
    annotations,
    addAnnotation,
    updateAnnotation,
    removeAnnotation,
    reports,
    activeReport,
    setActiveReport,
    startCapture,
    cancelCapture,
    saveReport,
    closeReview,
  };
});
