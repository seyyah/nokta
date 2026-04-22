import { useState } from 'react';
import { analyzePitch, analyzeFile } from '../api/analyzer';
import { AnalysisResult } from '../types';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { useAnalysisHistory } from './useAnalysisHistory';

export function usePitchAnalysis() {
  const [pitch, setPitch] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [showResult, setShowResult] = useState(false);
  const { saveToHistory } = useAnalysisHistory();

  const handleAnalyze = async () => {
    if (pitch.trim().length < 20) {
      alert('Lütfen en az 20 karakterlik bir pitch metni gir.');
      return;
    }
    
    setLoading(true);
    try {
      const res = await analyzePitch(pitch.trim());
      setResult(res);
      setShowResult(true);
      await saveToHistory(pitch.trim(), res);
    } catch (e) {
      console.error('Analiz hatası:', e);
      alert(`Analiz sırasında bir sorun oluştu: ${(e as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async () => {
    // Gemini anahtarı kontrolü
    const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
    if (!GEMINI_API_KEY || GEMINI_API_KEY.trim() === '') {
      alert('PDF analizi için Google Gemini API anahtarı gereklidir. Lütfen ayarlardan bir anahtar ekleyin.');
      return;
    }

    try {
      const doc = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (doc.canceled) return;

      const file = doc.assets[0];
      setLoading(true);

      const base64 = await FileSystem.readAsStringAsync(file.uri, {
        encoding: 'base64',
      });

      const res = await analyzeFile(base64, 'application/pdf');
      setPitch(`Dosya Analizi: ${file.name}`);
      setResult(res);
      setShowResult(true);
      await saveToHistory(`Dosya: ${file.name}`, res);
    } catch (e) {
      console.error('Dosya analiz hatası:', e);
      alert(`Dosya analizi sırasında bir sorun oluştu: ${(e as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  const showSpecificResult = (pitchText: string, analysisResult: AnalysisResult) => {
    setPitch(pitchText);
    setResult(analysisResult);
    setShowResult(true);
  };

  return {
    pitch,
    setPitch,
    loading,
    result,
    showResult,
    setShowResult,
    handleAnalyze,
    handleFileUpload,
    showSpecificResult,
  };
}
