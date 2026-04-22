import { useHistory } from '../context/HistoryContext';

export function useAnalysisHistory() {
  const { history, saveToHistory, clearHistory, loadHistory } = useHistory();

  return {
    history,
    saveToHistory,
    clearHistory,
    refreshHistory: loadHistory,
  };
}
