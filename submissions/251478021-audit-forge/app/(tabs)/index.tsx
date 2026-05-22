import { StyleSheet, Text, View, ScrollView, TextInput, TouchableOpacity, SafeAreaView, Dimensions, Modal, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';

const { width } = Dimensions.get('window');

const TRIPS = [
  { id: '1', company: 'Kamil Koç', time: '08:30', duration: '5s 45dk', price: 650, type: '2+1' },
  { id: '2', company: 'Metro Turizm', time: '09:00', duration: '6s 30dk', price: 580, type: '2+2' },
  { id: '3', company: 'Pamukkale', time: '11:15', duration: '6s 30dk', price: 720, type: '2+1' },
  { id: '4', company: 'Varan Turizm', time: '16:45', duration: '6s 15dk', price: 850, type: '2+1' },
];

export default function HomeScreen() {
  const [origin, setOrigin] = useState('İstanbul');
  const [destination, setDestination] = useState('Ankara');
  const [date, setDate] = useState('17.05.2026');
  const [showResults, setShowResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  
  // Seat Selection states
  const [showSeatModal, setShowSeatModal] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<any>(null);
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [occupiedSeats] = useState<number[]>([5, 12, 18, 24]);

  const handleSearch = () => {
    setIsSearching(true);
    setTimeout(() => {
      setIsSearching(false);
      setShowResults(true);
    }, 800);
  };

  const handleOpenSeatSelection = (trip: any) => {
    setSelectedTrip(trip);
    setSelectedSeats([]);
    setShowSeatModal(true);
  };

  const toggleSeat = (seatNum: number) => {
    if (occupiedSeats.includes(seatNum)) return;
    
    if (selectedSeats.includes(seatNum)) {
      setSelectedSeats(prev => prev.filter(s => s !== seatNum));
    } else {
      if (selectedSeats.length >= 4) {
        Alert.alert('Uyarı', 'En fazla 4 koltuk seçebilirsiniz.');
        return;
      }
      setSelectedSeats(prev => [...prev, seatNum]);
    }
  };

  const handleConfirmBooking = async () => {
    if (selectedSeats.length === 0) {
      Alert.alert('Uyarı', 'Lütfen en az bir koltuk seçin.');
      return;
    }
    setShowSeatModal(false);
    Alert.alert('Tebrikler', 'Biletiniz başarıyla rezerve edildi!');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoRow}>
            <Ionicons name="bus" size={28} color="#3B82F6" />
            <Text style={styles.logoText}>NexBus</Text>
          </View>
          <TouchableOpacity style={styles.loginBtn}>
            <Ionicons name="person-outline" size={20} color="#3B82F6" />
            <Text style={styles.loginBtnText}>Giriş Yap</Text>
          </TouchableOpacity>
        </View>

        {/* Hero Section */}
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Yolculuğunu Keşfet</Text>
          <Text style={styles.heroSubtitle}>En konforlu seferler seni bekliyor.</Text>
        </View>

        {/* Search Card */}
        <View style={styles.searchCard}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>NEREDEN</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="location" size={20} color="#3B82F6" />
              <TextInput 
                style={styles.input} 
                value={origin} 
                onChangeText={setOrigin}
                placeholder="Şehir Seçin"
                placeholderTextColor="#94A3B8"
              />
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>NEREYE</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="navigate" size={20} color="#3B82F6" />
              <TextInput 
                style={styles.input} 
                value={destination} 
                onChangeText={setDestination}
                placeholder="Şehir Seçin"
                placeholderTextColor="#94A3B8"
              />
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>GİDİŞ TARİHİ</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="calendar" size={20} color="#3B82F6" />
              <TextInput 
                style={styles.input} 
                value={date} 
                onChangeText={setDate}
                placeholder="Tarih Seçin"
                placeholderTextColor="#94A3B8"
              />
            </View>
          </View>

          <TouchableOpacity 
            style={styles.searchBtn}
            onPress={handleSearch}
          >
            {isSearching ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.searchBtnText}>Bileti Bul</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Results */}
        {showResults && (
          <View style={styles.resultsContainer}>
            <View style={styles.resultsHeader}>
              <Text style={styles.resultsTitle}>Uygun Seferler</Text>
              <Text style={styles.resultsCount}>{TRIPS.length} Sefer Bulundu</Text>
            </View>

            {TRIPS.map((trip) => (
              <TouchableOpacity key={trip.id} style={styles.tripCard}>
                <View style={styles.tripTop}>
                  <View style={styles.companyBadge}>
                    <Text style={styles.companyText}>{trip.company}</Text>
                  </View>
                  <Text style={styles.busType}>{trip.type} Konfor</Text>
                </View>

                <View style={styles.tripMiddle}>
                  <View style={styles.timeBox}>
                    <Text style={styles.time}>{trip.time}</Text>
                    <Text style={styles.city}>{origin}</Text>
                  </View>
                  
                  <View style={styles.durationBox}>
                    <Text style={styles.durationText}>{trip.duration}</Text>
                    <View style={styles.line} />
                    <Ionicons name="bus-outline" size={16} color="#475569" />
                  </View>

                  <View style={styles.timeBox}>
                    <Text style={styles.time}>--:--</Text>
                    <Text style={styles.city}>{destination}</Text>
                  </View>
                </View>

                <View style={styles.tripBottom}>
                  <Text style={styles.price}>{trip.price} TL</Text>
                  <TouchableOpacity 
                    style={styles.selectBtn}
                    onPress={() => handleOpenSeatSelection(trip)}
                  >
                    <Text style={styles.selectBtnText}>Koltuk Seç</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Seat Selection Modal */}
      <Modal
        visible={showSeatModal}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { height: '85%' }]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>{selectedTrip?.company}</Text>
                <Text style={styles.modalSubtitle}>{origin} → {destination}</Text>
              </View>
              <TouchableOpacity onPress={() => setShowSeatModal(false)}>
                <Ionicons name="close" size={24} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.busLayout}>
                <View style={styles.busFront}>
                  <Text style={styles.busFrontText}>ÖN</Text>
                  <Ionicons name="car" size={24} color="#475569" />
                </View>
                
                <View style={styles.seatsContainer}>
                  {Array.from({ length: 10 }).map((_, rowIndex) => (
                    <View key={rowIndex} style={styles.seatRow}>
                      <TouchableOpacity 
                        style={[
                          styles.seat,
                          occupiedSeats.includes(rowIndex * 3 + 1) && styles.seatOccupied,
                          selectedSeats.includes(rowIndex * 3 + 1) && styles.seatSelected
                        ]}
                        onPress={() => toggleSeat(rowIndex * 3 + 1)}
                      >
                        <Text style={[styles.seatText, (selectedSeats.includes(rowIndex * 3 + 1) || occupiedSeats.includes(rowIndex * 3 + 1)) && { color: '#FFF' }]}>
                          {rowIndex * 3 + 1}
                        </Text>
                      </TouchableOpacity>

                      <View style={styles.aisle} />

                      <View style={styles.doubleSeats}>
                        <TouchableOpacity 
                          style={[
                            styles.seat,
                            occupiedSeats.includes(rowIndex * 3 + 2) && styles.seatOccupied,
                            selectedSeats.includes(rowIndex * 3 + 2) && styles.seatSelected
                          ]}
                          onPress={() => toggleSeat(rowIndex * 3 + 2)}
                        >
                          <Text style={[styles.seatText, (selectedSeats.includes(rowIndex * 3 + 2) || occupiedSeats.includes(rowIndex * 3 + 2)) && { color: '#FFF' }]}>
                            {rowIndex * 3 + 2}
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                          style={[
                            styles.seat,
                            occupiedSeats.includes(rowIndex * 3 + 3) && styles.seatOccupied,
                            selectedSeats.includes(rowIndex * 3 + 3) && styles.seatSelected
                          ]}
                          onPress={() => toggleSeat(rowIndex * 3 + 3)}
                        >
                          <Text style={[styles.seatText, (selectedSeats.includes(rowIndex * 3 + 3) || occupiedSeats.includes(rowIndex * 3 + 3)) && { color: '#FFF' }]}>
                            {rowIndex * 3 + 3}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            </ScrollView>

            <View style={styles.bookingFooter}>
              <View>
                <Text style={styles.footerLabel}>Seçilen: {selectedSeats.length} Koltuk</Text>
                <Text style={styles.footerPrice}>{(selectedSeats.length * (selectedTrip?.price || 0))} TL</Text>
              </View>
              <TouchableOpacity 
                style={[styles.confirmBtn, selectedSeats.length === 0 && { opacity: 0.5 }]}
                onPress={handleConfirmBooking}
              >
                <Text style={styles.confirmBtnText}>Bileti Al</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  scrollContent: {
    paddingBottom: 150,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    height: 60,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#3B82F6',
  },
  loginBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  loginBtnText: {
    color: '#3B82F6',
    fontWeight: '700',
    fontSize: 14,
  },
  hero: {
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#F8FAFC',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#94A3B8',
  },
  searchCard: {
    backgroundColor: '#1E293B',
    marginHorizontal: 20,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  inputGroup: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    marginBottom: 8,
    letterSpacing: 1,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#334155',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 50,
    gap: 10,
  },
  input: {
    flex: 1,
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginBottom: 15,
  },
  searchBtn: {
    backgroundColor: '#3B82F6',
    height: 55,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  searchBtnText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  resultsContainer: {
    paddingHorizontal: 20,
    marginTop: 30,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  resultsTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  resultsCount: {
    fontSize: 13,
    color: '#94A3B8',
  },
  tripCard: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  tripTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  companyBadge: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  companyText: {
    color: '#0F172A',
    fontWeight: '800',
    fontSize: 12,
  },
  busType: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  tripMiddle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  timeBox: {
    alignItems: 'center',
  },
  time: {
    fontSize: 22,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  city: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  durationBox: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  durationText: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 4,
  },
  line: {
    height: 2,
    backgroundColor: '#334155',
    width: '100%',
    marginBottom: 4,
  },
  tripBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
    paddingTop: 15,
  },
  price: {
    fontSize: 24,
    fontWeight: '800',
    color: '#3B82F6',
  },
  selectBtn: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#3B82F6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  selectBtnText: {
    color: '#3B82F6',
    fontWeight: '800',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#1E293B',
    padding: 24,
    paddingBottom: 40,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  busLayout: {
    backgroundColor: '#334155',
    borderRadius: 20,
    padding: 20,
    marginTop: 10,
  },
  busFront: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 20,
  },
  busFrontText: {
    color: '#94A3B8',
    fontWeight: '800',
    fontSize: 14,
  },
  seatsContainer: {
    gap: 15,
  },
  seatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  doubleSeats: {
    flexDirection: 'row',
    gap: 10,
  },
  aisle: {
    width: 30,
  },
  seat: {
    width: 40,
    height: 40,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  seatSelected: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  seatOccupied: {
    backgroundColor: '#EF4444',
    borderColor: '#EF4444',
    opacity: 0.3,
  },
  seatText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  bookingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    marginTop: 20,
  },
  footerLabel: {
    fontSize: 12,
    color: '#94A3B8',
  },
  footerPrice: {
    fontSize: 24,
    fontWeight: '800',
    color: '#3B82F6',
  },
  confirmBtn: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 12,
  },
  confirmBtnText: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 16,
  }
});
