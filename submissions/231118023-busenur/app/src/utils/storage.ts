import AsyncStorage from '@react-native-async-storage/async-storage';

export interface WaterLog {
  id: string;
  amount: number; // in ml
  timestamp: string; // ISO string
}

const LOGS_KEY = '@hydroflow_logs';
const TARGET_KEY = '@hydroflow_target';
const WEIGHT_KEY = '@hydroflow_weight';
const REMINDERS_KEY = '@hydroflow_reminders';

export const storage = {
  async getWaterLogs(): Promise<WaterLog[]> {
    try {
      const data = await AsyncStorage.getItem(LOGS_KEY);
      if (!data) return [];
      const parsed = JSON.parse(data) as WaterLog[];
      // Filter only today's logs for the main screen, but we store all logs
      const todayStr = new Date().toDateString();
      return parsed.filter(log => new Date(log.timestamp).toDateString() === todayStr);
    } catch (e) {
      console.error('Failed to load logs', e);
      return [];
    }
  },

  async getAllLogs(): Promise<WaterLog[]> {
    try {
      const data = await AsyncStorage.getItem(LOGS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Failed to load all logs', e);
      return [];
    }
  },

  async addWaterLog(amount: number): Promise<WaterLog[]> {
    try {
      const current = await this.getAllLogs();
      const newLog: WaterLog = {
        id: Math.random().toString(36).substring(2, 9),
        amount,
        timestamp: new Date().toISOString(),
      };
      const updated = [newLog, ...current];
      await AsyncStorage.setItem(LOGS_KEY, JSON.stringify(updated));
      return updated.filter(log => new Date(log.timestamp).toDateString() === new Date().toDateString());
    } catch (e) {
      console.error('Failed to add log', e);
      return [];
    }
  },

  async deleteWaterLog(id: string): Promise<WaterLog[]> {
    try {
      const current = await this.getAllLogs();
      // INTENTIONAL STATE SYNC BUG (Bug 3):
      // We will mutate the list but NOT save it correctly in the active state if it's called from certain screens,
      // or we will just delete it from storage but not trigger the main screen's local state immediately.
      // For now, let's write a standard delete helper that updates storage, but we'll introduce the bug in the UI
      // by not refreshing the state on the Dashboard screen.
      const updated = current.filter(log => log.id !== id);
      await AsyncStorage.setItem(LOGS_KEY, JSON.stringify(updated));
      return updated.filter(log => new Date(log.timestamp).toDateString() === new Date().toDateString());
    } catch (e) {
      console.error('Failed to delete log', e);
      return [];
    }
  },

  async getGoal(): Promise<number> {
    try {
      const val = await AsyncStorage.getItem(TARGET_KEY);
      return val ? parseInt(val, 10) : 2500;
    } catch {
      return 2500;
    }
  },

  async setGoal(target: number): Promise<void> {
    try {
      await AsyncStorage.setItem(TARGET_KEY, target.toString());
    } catch (e) {
      console.error('Failed to save goal', e);
    }
  },

  async getWeight(): Promise<number> {
    try {
      const val = await AsyncStorage.getItem(WEIGHT_KEY);
      return val ? parseFloat(val) : 70;
    } catch {
      return 70;
    }
  },

  async setWeight(weight: number): Promise<void> {
    try {
      await AsyncStorage.setItem(WEIGHT_KEY, weight.toString());
    } catch (e) {
      console.error('Failed to save weight', e);
    }
  },

  async getReminders(): Promise<boolean> {
    try {
      const val = await AsyncStorage.getItem(REMINDERS_KEY);
      return val === 'true';
    } catch {
      return true;
    }
  },

  async setReminders(enabled: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem(REMINDERS_KEY, enabled.toString());
    } catch (e) {
      console.error('Failed to save reminders', e);
    }
  },

  // Mock data generator for past 7 days to draw the chart
  getPastSevenDaysLogs(currentTodayTotal: number): { day: string; amount: number; met: boolean }[] {
    const days = ['Pzr', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
    const result = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dayName = days[d.getDay()];
      
      if (i === 0) {
        result.push({ day: dayName, amount: currentTodayTotal, met: currentTodayTotal >= 2500 });
      } else {
        // Deterministic mock values based on the day
        const mockAmounts = [1800, 2600, 2200, 2800, 2500, 1500];
        const val = mockAmounts[(d.getDate() + d.getMonth()) % mockAmounts.length];
        result.push({ day: dayName, amount: val, met: val >= 2500 });
      }
    }
    return result;
  }
};
