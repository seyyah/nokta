import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions, DimensionValue } from 'react-native';

interface DashboardProps {
  currentWater: number;
  targetWater: number;
  onAddWater: (amount: number) => void;
}

const { width } = Dimensions.get('window');

export default function Dashboard({ currentWater, targetWater, onAddWater }: DashboardProps) {
  const percentage = Math.min(Math.round((currentWater / targetWater) * 100), 100);
  
  // Custom glass wave height
  const waterHeight = `${percentage}%` as DimensionValue;

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Günlük Durum</Text>
        
        {/* Dynamic Water Cup Visual */}
        <View style={styles.cupOutline}>
          {percentage > 0 && (
            <View style={[styles.waterFill, { height: waterHeight }]} />
          )}
          <View style={styles.cupContent}>
            <Text style={styles.percentageText}>{percentage}%</Text>
            <Text style={styles.amountText}>{currentWater} / {targetWater} ml</Text>
          </View>
        </View>

        <Text style={styles.subtitle}>
          {percentage >= 100 
            ? 'Tebrikler! Bugünlük hedefini tamamladın! 🎉' 
            : `Hedefine ulaşmak için ${Math.max(targetWater - currentWater, 0)} ml daha içmelisin.`}
        </Text>
      </View>

      {/* QUICK ADD BUTTONS WITH INTENTIONAL VISUAL BUG (Bug 1):
          The buttons have fixed widths and a row direction, but they lack proper flexWrap/spacing,
          which will cause them to overflow or look cut off / overlapped on some screens.
          Also, we use absolute sizes and no margin-bottom causing overlapping on some devices. */}
      <View style={styles.quickAddSection}>
        <Text style={styles.sectionTitle}>Hızlı Ekle</Text>
        <View style={styles.btnRow}>
          <TouchableOpacity 
            style={styles.waterBtn} 
            onPress={() => onAddWater(250)}
          >
            <Text style={styles.btnEmoji}>🥤</Text>
            <Text style={styles.btnLabel}>Bardak</Text>
            <Text style={styles.btnMl}>+250ml</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.waterBtn} 
            onPress={() => onAddWater(500)}
          >
            <Text style={styles.btnEmoji}>💧</Text>
            <Text style={styles.btnLabel}>Şişe</Text>
            <Text style={styles.btnMl}>+500ml</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.waterBtn} 
            onPress={() => onAddWater(750)}
          >
            <Text style={styles.btnEmoji}>🍼</Text>
            <Text style={styles.btnLabel}>Matara</Text>
            <Text style={styles.btnMl}>+750ml</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '100%',
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 24,
  },
  title: {
    color: '#38BDF8',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 20,
  },
  cupOutline: {
    width: 180,
    height: 240,
    borderWidth: 4,
    borderColor: '#38BDF8',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    backgroundColor: '#0F172A',
    position: 'relative',
    marginVertical: 10,
  },
  waterFill: {
    backgroundColor: '#0284C7',
    width: '100%',
    position: 'absolute',
    bottom: 0,
    left: 0,
  },
  cupContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  percentageText: {
    color: '#FFF',
    fontSize: 36,
    fontWeight: '800',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  amountText: {
    color: '#E2E8F0',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  subtitle: {
    color: '#94A3B8',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 20,
  },
  quickAddSection: {
    width: '100%',
    alignItems: 'flex-start',
  },
  sectionTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  
  // INTENTIONAL VISUAL BUG AREA:
  // btnRow and waterBtn have layout issues that cause them to look squished/overlapped.
  // We use fixed width: 110, which on smaller screens overflows because 110 * 3 = 330,
  // plus padding exceeds window width!
  btnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    flexWrap: 'wrap',
    gap: 8,
  },
  waterBtn: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    flex: 1,
    minWidth: 90,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  btnEmoji: {
    fontSize: 28,
  },
  btnLabel: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  btnMl: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
});
