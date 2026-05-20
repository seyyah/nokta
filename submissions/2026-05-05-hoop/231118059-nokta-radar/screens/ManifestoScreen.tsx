import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Terminal, ShieldAlert, Cpu, Network, Zap } from 'lucide-react-native';
import RadarBackground from '../components/RadarBackground';

export default function ManifestoScreen() {
  return (
    <View style={styles.container}>
      <RadarBackground />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.header}>
          <Terminal color="#00E5FF" size={32} />
          <Text style={styles.headerTitle}>MANİFESTO</Text>
        </View>
        <Text style={styles.headerSubtitle}>Anti-Slop Due Diligence Engine</Text>

        <Section icon={<Cpu color="#00FF41" size={20}/>} title="1. Tez (Thesis)">
          <Text style={styles.text}>
            Yapay zeka çağında jenerik fikir üretmek saniyeler alırken, bu fikirlerin uygulanabilirliğini ve özgünlüğünü test etmek en kıt kaynak haline gelmiştir. Nokta Radar, "ucuz metin" ile "gerçek üretim iskeleti" arasındaki farkı ortaya koyan bir filtre görevi görür.
          </Text>
        </Section>

        <Section icon={<ShieldAlert color="#FF003C" size={20}/>} title="2. Problem">
          <Text style={styles.text}>• Pitch Enflasyonu: Pazar doğrulaması aylar sürer.</Text>
          <Text style={styles.text}>• Slop Yayılımı: LLM'ler gerçek inovasyonun önünde gürültü yaratıyor.</Text>
          <Text style={styles.text}>• Yatırımcı Yorgunluğu: Değerlendiriciler gerçek fırsatları kaçırıyor.</Text>
        </Section>

        <Section icon={<Network color="#00E5FF" size={20}/>} title="3. Analiz Metrikleri">
          <Text style={styles.text}>
            <Text style={styles.bold}>Teknik Derinlik:</Text> Fikir, standart bir wrapper'dan fazlasını sunuyor mu?
          </Text>
          <Text style={styles.text}>
            <Text style={styles.bold}>Savunulabilirlik:</Text> Rakipler bu fikri ne kadar sürede kopyalayabilir?
          </Text>
          <Text style={styles.text}>
            <Text style={styles.bold}>Pazar Gerçekliği:</Text> İddia edilen kullanıcı problemi gerçekten var mı?
          </Text>
        </Section>

        <Section icon={<Zap color="#00E5FF" size={20}/>} title="Neden Nokta?">
          <Text style={styles.text}>
            Çünkü biz sadece fikirleri toplamıyoruz; onları yatırım değerlendirme aşamasından saniyeler içinde geçirerek riskleri eliyoruz. Nokta Radar, solo-girişimciyi dev bir Ar-Ge departmanı gibi güçlü, yatırımcıyı ise bir veri bilimcisi gibi analitik kılar.
          </Text>
        </Section>

      </ScrollView>
    </View>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode, title: string, children: React.ReactNode }) {
  return (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        {icon}
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <View style={styles.sectionContent}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 60,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerTitle: {
    color: '#00E5FF',
    fontFamily: 'monospace',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 2,
    marginLeft: 12,
  },
  headerSubtitle: {
    color: '#888',
    fontFamily: 'monospace',
    fontSize: 14,
    letterSpacing: 1,
    marginBottom: 40,
  },
  sectionContainer: {
    backgroundColor: 'rgba(10, 10, 10, 0.7)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 20,
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    paddingBottom: 10,
  },
  sectionTitle: {
    color: '#E0E0E0',
    fontFamily: 'monospace',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  sectionContent: {
    gap: 8,
  },
  text: {
    color: '#AAA',
    lineHeight: 22,
    fontFamily: 'monospace',
    fontSize: 13,
  },
  bold: {
    color: '#00E5FF',
    fontWeight: 'bold',
  }
});
