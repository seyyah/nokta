import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { WaterLog } from '../utils/storage';

interface HistoryProps {
  logs: WaterLog[];
  targetWater: number;
  onDeleteLog: (id: string) => void;
  pastDaysData: { day: string; amount: number; met: boolean }[];
}

export default function History({ logs, targetWater, onDeleteLog, pastDaysData }: HistoryProps) {
  
  const formatTime = (isoString: string) => {
    const d = new Date(isoString);
    const h = d.getHours().toString().padStart(2, '0');
    const m = d.getMinutes().toString().padStart(2, '0');
    return `${h}:${m}`;
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Past 7 Days Chart */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Son 7 Günlük Takip</Text>
        <View style={styles.chartRow}>
          {pastDaysData.map((data, index) => {
            // Calculate height percentage relative to a max amount (e.g. 4000ml)
            const maxVal = 4000;
            const barHeight = Math.max(Math.min((data.amount / maxVal) * 120, 120), 8);
            return (
              <View key={index} style={styles.chartCol}>
                <View style={styles.barContainer}>
                  <View 
                    style={[
                      styles.barFill, 
                      { height: barHeight },
                      data.met ? styles.barMet : styles.barNotMet
                    ]} 
                  />
                </View>
                <Text style={styles.dayText}>{data.day}</Text>
              </View>
            );
          })}
        </View>
        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, styles.barMet]} />
            <Text style={styles.legendText}>Hedef Ulaşıldı</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, styles.barNotMet]} />
            <Text style={styles.legendText}>Eksik Kaldı</Text>
          </View>
        </View>
      </View>

      {/* Today's Logs */}
      <View style={styles.logsSection}>
        <Text style={styles.sectionTitle}>Bugün Girilen Kayıtlar</Text>
        {logs.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>💧 Henüz su kaydı girmedin.</Text>
          </View>
        ) : (
          logs.map((log) => (
            <View key={log.id} style={styles.logItem}>
              <View style={styles.logInfo}>
                <Text style={styles.logEmoji}>🥛</Text>
                <View>
                  <Text style={styles.logAmount}>{log.amount} ml</Text>
                  <Text style={styles.logTime}>{formatTime(log.timestamp)}</Text>
                </View>
              </View>
              {/* DELETE BUTTON WITH INTENTIONAL STATE SYNC BUG (Bug 3):
                  The delete action updates the storage but due to a parent state issue,
                  the total water count on Dashboard does not reflect this deletion until reloaded. */}
              <TouchableOpacity 
                style={styles.deleteBtn} 
                onPress={() => onDeleteLog(log.id)}
              >
                <Text style={styles.deleteText}>Sil</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 24,
    padding: 20,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 24,
  },
  cardTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  chartRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 140,
    paddingHorizontal: 8,
  },
  chartCol: {
    alignItems: 'center',
    flex: 1,
  },
  barContainer: {
    height: 120,
    width: 14,
    backgroundColor: '#0F172A',
    borderRadius: 7,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: 7,
  },
  barMet: {
    backgroundColor: '#10B981', // Emerald green
  },
  barNotMet: {
    backgroundColor: '#38BDF8', // Cyan blue
  },
  dayText: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 6,
    fontWeight: '600',
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  logsSection: {
    width: '100%',
  },
  sectionTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  emptyContainer: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '600',
  },
  logItem: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  logInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logEmoji: {
    fontSize: 24,
  },
  logAmount: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '700',
  },
  logTime: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
  },
  deleteBtn: {
    backgroundColor: '#EF4444',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  deleteText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
