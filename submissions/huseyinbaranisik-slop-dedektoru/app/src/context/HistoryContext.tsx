import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AnalysisResult } from '../types';

const HISTORY_KEY = '@nokta_analysis_history';

export interface HistoryItem {
  id: string;
  pitch: string;
  result: AnalysisResult;
  timestamp: number;
}

interface HistoryContextType {
  history: HistoryItem[];
  saveToHistory: (pitch: string, result: AnalysisResult) => Promise<void>;
  clearHistory: () => Promise<void>;
  loadHistory: () => Promise<void>;
}

const HistoryContext = createContext<HistoryContextType | undefined>(undefined);

export function HistoryProvider({ children }: { children: React.ReactNode }) {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const stored = await AsyncStorage.getItem(HISTORY_KEY);
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Geçmiş yüklenemedi', e);
    }
  };

  const saveToHistory = async (pitch: string, result: AnalysisResult) => {
    try {
      const newItem: HistoryItem = {
        id: Date.now().toString(),
        pitch,
        result,
        timestamp: Date.now(),
      };
      
      const updatedHistory = [newItem, ...history].slice(0, 10);
      setHistory(updatedHistory);
      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
    } catch (e) {
      console.error('Geçmişe kaydedilemedi', e);
    }
  };

  const clearHistory = async () => {
    try {
      setHistory([]);
      await AsyncStorage.removeItem(HISTORY_KEY);
    } catch (e) {
      console.error('Geçmiş silinemedi', e);
    }
  };

  return (
    <HistoryContext.Provider value={{ history, saveToHistory, clearHistory, loadHistory }}>
      {children}
    </HistoryContext.Provider>
  );
}

export function useHistory() {
  const context = useContext(HistoryContext);
  if (context === undefined) {
    throw new Error('useHistory must be used within a HistoryProvider');
  }
  return context;
}
