import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

export default function ExploreScreen() {
  return (
    <LinearGradient colors={["#07111F", "#0B1020", "#111827"]} style={styles.root}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.kicker}>NOKTA / EXPLORE</Text>

        <Text style={styles.title}>Nokta ne yapar?</Text>

        <Text style={styles.description}>
          Nokta; dağınık fikirleri, ham notları ve belirsiz proje düşüncelerini daha net,
          uygulanabilir ve mühendislik odaklı çıktılara dönüştüren mobil yapay zeka asistanıdır.
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>1. Fikri netleştirir</Text>
          <Text style={styles.cardText}>
            Kullanıcının yazdığı ham fikri alır ve 3-5 mühendislik sorusuyla kapsam, kullanıcı,
            problem ve kısıtları netleştirir.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>2. Slop kontrolü yapar</Text>
          <Text style={styles.cardText}>
            Fikrin fazla genel, temelsiz veya abartılı taraflarını tespit eder. Daha gerçekçi ve
            uygulanabilir hale getirmek için öneriler sunar.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>3. Spec üretmeye yardım eder</Text>
          <Text style={styles.cardText}>
            Ham fikirden ürün özeti, hedef kullanıcı, temel akış, teknik ihtiyaçlar ve MVP kapsamı
            gibi başlıklar çıkarır.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>4. Karakter gibi tepki verir</Text>
          <Text style={styles.cardText}>
            Avatar bekleme, uyku, düşünme, konuşma, mutlu olma ve kızma gibi durumlara göre tepki
            verir. Böylece uygulama düz bir chatbot gibi değil, etkileşimli bir asistan gibi
            davranır.
          </Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1
  },
  content: {
    paddingTop: 64,
    paddingHorizontal: 20,
    paddingBottom: 32
  },
  kicker: {
    color: "#67E8F9",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1.6
  },
  title: {
    color: "#FFFFFF",
    fontSize: 30,
    lineHeight: 36,
    fontWeight: "900",
    marginTop: 8
  },
  description: {
    color: "rgba(234,246,255,0.72)",
    fontSize: 15,
    lineHeight: 23,
    marginTop: 12,
    marginBottom: 18
  },
  card: {
    padding: 16,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.11)",
    marginBottom: 12
  },
  cardTitle: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "900",
    marginBottom: 7
  },
  cardText: {
    color: "rgba(234,246,255,0.7)",
    fontSize: 14,
    lineHeight: 21
  }
});