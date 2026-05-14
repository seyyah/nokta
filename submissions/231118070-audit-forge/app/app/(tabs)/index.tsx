import React, { useState } from "react";
import {
  Alert,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type Report = {
  screen: string;
  note: string;
  box: string;
};

function AuditWidget({ currentScreen }: { currentScreen: string }) {
  const [visible, setVisible] = useState(false);
  const [note, setNote] = useState("");
  const [reports, setReports] = useState<Report[]>([]);

  const createReport = () => {
    if (!note.trim()) {
      Alert.alert("Eksik not", "Lütfen kısa bir hata notu yaz.");
      return;
    }

    const newReport: Report = {
      screen: currentScreen,
      note,
      box: "x:40 y:120 w:260 h:90",
    };

    setReports([newReport, ...reports]);
    setNote("");
    setVisible(false);
    Alert.alert(
      "Audit raporu üretildi",
      `${currentScreen} için Markdown rapor simüle edildi.`,
    );
  };

  return (
    <>
      <TouchableOpacity style={styles.fab} onPress={() => setVisible(true)}>
        <Text style={styles.fabText}>!</Text>
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.auditBox}>
            <Text style={styles.auditTitle}>Nokta Audit Widget</Text>
            <Text style={styles.auditSubtitle}>Ekran: {currentScreen}</Text>

            <View style={styles.yellowBox}>
              <Text style={styles.yellowText}>
                Sarı kutu ile işaretlenen alan
              </Text>
            </View>

            <TextInput
              style={styles.auditInput}
              multiline
              placeholder="Bu ekranda gördüğün sorunu yaz..."
              value={note}
              onChangeText={setNote}
            />

            <TouchableOpacity style={styles.auditButton} onPress={createReport}>
              <Text style={styles.auditButtonText}>Markdown Rapor Üret</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setVisible(false)}>
              <Text style={styles.closeText}>Kapat</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {reports.length > 0 && (
        <View style={styles.reportPreview}>
          <Text style={styles.reportTitle}>Son Audit Raporları</Text>
          {reports.slice(0, 3).map((report, index) => (
            <Text key={index} style={styles.reportText}>
              {report.screen}: {report.note}
            </Text>
          ))}
        </View>
      )}
    </>
  );
}

export default function Index() {
  const [screen, setScreen] = useState("Onboarding");

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>NOKTA Audit Forge</Text>
        <Text style={styles.subtitle}>
          Müşteri hatayı yakalar, agent raporu okur, geliştirici düzeltir.
        </Text>

        <View style={styles.tabs}>
          {["Onboarding", "IdeaList", "IdeaDetail"].map((item) => (
            <TouchableOpacity
              key={item}
              style={[styles.tab, screen === item && styles.activeTab]}
              onPress={() => setScreen(item)}
            >
              <Text
                style={[
                  styles.tabText,
                  screen === item && styles.activeTabText,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {screen === "Onboarding" && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Onboarding</Text>
            <Text style={styles.cardText}>
              Kullanıcı uygulamanın audit-forge döngüsünü burada öğrenir.
            </Text>
          </View>
        )}

        {screen === "IdeaList" && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Idea List</Text>
            <Text style={styles.cardText}>
              Kullanıcının yakaladığı fikirler ve audit notları bu ekranda
              listelenir.
            </Text>
          </View>
        )}

        {screen === "IdeaDetail" && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Idea Detail</Text>
            <Text style={styles.cardText}>
              Seçilen fikrin detayları, müşteri notu ve forge repair geçmişi
              gösterilir.
            </Text>
          </View>
        )}
      </ScrollView>

      <AuditWidget currentScreen={screen} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  content: { padding: 20, paddingBottom: 120 },
  title: { fontSize: 28, fontWeight: "800", color: "#111827", marginBottom: 8 },
  subtitle: { fontSize: 15, color: "#4b5563", marginBottom: 20 },
  tabs: { flexDirection: "row", gap: 8, marginBottom: 18 },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: "#e5e7eb",
  },
  activeTab: { backgroundColor: "#2563eb" },
  tabText: { color: "#374151", fontWeight: "700", fontSize: 12 },
  activeTabText: { color: "#fff" },
  card: {
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 8,
    color: "#111827",
  },
  cardText: { fontSize: 15, color: "#374151", lineHeight: 22 },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 28,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#f59e0b",
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
  },
  fabText: { color: "#111827", fontSize: 28, fontWeight: "900" },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  auditBox: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 18,
    width: "100%",
  },
  auditTitle: { fontSize: 22, fontWeight: "800", color: "#111827" },
  auditSubtitle: { fontSize: 14, color: "#6b7280", marginBottom: 12 },
  yellowBox: {
    borderWidth: 3,
    borderColor: "#facc15",
    backgroundColor: "#fef9c3",
    borderRadius: 12,
    height: 90,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  yellowText: { color: "#854d0e", fontWeight: "700" },
  auditInput: {
    minHeight: 90,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 12,
    padding: 12,
    textAlignVertical: "top",
    marginBottom: 12,
  },
  auditButton: {
    backgroundColor: "#16a34a",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 10,
  },
  auditButtonText: { color: "#fff", fontWeight: "800" },
  closeText: { textAlign: "center", color: "#6b7280", fontWeight: "700" },
  reportPreview: {
    position: "absolute",
    left: 20,
    right: 90,
    bottom: 24,
    backgroundColor: "#fff7ed",
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: "#fed7aa",
  },
  reportTitle: { fontWeight: "800", color: "#9a3412", marginBottom: 4 },
  reportText: { fontSize: 12, color: "#7c2d12" },
});
