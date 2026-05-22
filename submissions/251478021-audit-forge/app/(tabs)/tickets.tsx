import { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Text, View, ScrollView, SafeAreaView, TouchableOpacity, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function TicketsScreen() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadTickets = async () => {
    try {
      const data = await AsyncStorage.getItem('user_tickets');
      if (data) {
        setTickets(JSON.parse(data));
      }
    } catch (error) {
      console.error('Failed to load tickets', error);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadTickets();
    setRefreshing(false);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Biletlerim</Text>
      </View>
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3B82F6" />
        }
      >
        {tickets.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="ticket-outline" size={80} color="#334155" />
            <Text style={styles.emptyText}>Henüz aktif biletiniz bulunmuyor.</Text>
            <TouchableOpacity style={styles.buyBtn}>
              <Text style={styles.buyBtnText}>Bilet Al</Text>
            </TouchableOpacity>
          </View>
        ) : (
          tickets.map((ticket) => (
            <View key={ticket.id} style={styles.ticketCard}>
              <View style={styles.ticketHeader}>
                <Text style={styles.companyName}>{ticket.company}</Text>
                <View style={styles.dateBadge}>
                  <Text style={styles.dateText}>{ticket.date}</Text>
                </View>
              </View>

              <View style={styles.ticketBody}>
                <View style={styles.routeRow}>
                  <View style={styles.cityBox}>
                    <Text style={styles.timeText}>{ticket.time}</Text>
                    <Text style={styles.cityName}>{ticket.origin}</Text>
                  </View>
                  <View style={styles.lineBox}>
                    <Ionicons name="bus" size={20} color="#3B82F6" />
                    <View style={styles.dashLine} />
                  </View>
                  <View style={styles.cityBox}>
                    <Text style={styles.timeText}>--:--</Text>
                    <Text style={styles.cityName}>{ticket.destination}</Text>
                  </View>
                </View>

                <View style={styles.ticketDivider} />

                <View style={styles.ticketFooter}>
                  <View>
                    <Text style={styles.footerLabel}>Koltuklar</Text>
                    <Text style={styles.footerValue}>{ticket.seats.join(', ')}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.footerLabel}>Toplam Tutar</Text>
                    <Text style={styles.footerValue}>{ticket.price} TL</Text>
                  </View>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  scrollContent: {
    padding: 20,
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 100,
  },
  emptyText: {
    color: '#64748B',
    fontSize: 16,
    marginTop: 20,
    marginBottom: 30,
  },
  buyBtn: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 12,
  },
  buyBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 16,
  },
  ticketCard: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    marginBottom: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#334155',
  },
  companyName: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
  },
  dateBadge: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  dateText: {
    color: '#3B82F6',
    fontSize: 12,
    fontWeight: '700',
  },
  ticketBody: {
    padding: 20,
  },
  routeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  cityBox: {
    alignItems: 'center',
    width: 80,
  },
  timeText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  cityName: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
  },
  lineBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dashLine: {
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginTop: 10,
  },
  ticketDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginVertical: 20,
  },
  ticketFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerLabel: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 4,
  },
  footerValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F8FAFC',
  }
});
