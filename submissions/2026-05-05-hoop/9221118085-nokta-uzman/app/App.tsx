import React, { useState } from "react";
import {
  Alert,
  FlatList,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { ExpertRequest, Message } from "./src/types";
import { aiReview } from "./src/services/expertLogic";

export default function App() {
  const [screen, setScreen] = useState<"chat" | "expert">("chat");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "ai",
      text: "Merhaba! Ben Nokta. Fikrini paylaş, uzman desteği gerekip gerekmediğini birlikte değerlendirelim.",
    },
  ]);
  const [requests, setRequests] = useState<ExpertRequest[]>([]);

  async function sendIdea() {
    if (!input.trim() || loading) return;

    const idea = input.trim();
    setInput("");
    setLoading(true);

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      text: idea,
    };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const review = await aiReview(idea);

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        text: review.reply,
      };
      setMessages((prev) => [...prev, aiMessage]);

      if (review.riskLevel !== "Low") {
        const newRequest: ExpertRequest = {
          id: Date.now().toString(),
          idea,
          aiSummary: review.reply,
          riskLevel: review.riskLevel,
          status: "Pending",
        };
        setRequests((prev) => [newRequest, ...prev]);

        const escalationMessage: Message = {
          id: (Date.now() + 2).toString(),
          role: "ai",
          text:
            review.riskLevel === "High"
              ? "⚠️ Bu fikir uzman incelemesine alındı. Uzman sekmesinden takip edebilirsin."
              : "ℹ️ Bu fikir uzman kuyruğuna eklendi. Uzman görüşü için bekleyebilirsin.",
        };
        setMessages((prev) => [...prev, escalationMessage]);
      }
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "ai",
          text: "Bir hata oluştu. Lütfen tekrar dene.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function reviewRequest(id: string, verdict: string) {
    setRequests((prev) =>
      prev.map((request) =>
        request.id === id
          ? { ...request, status: "Reviewed", expertVerdict: verdict }
          : request
      )
    );

    const expertMessage: Message = {
      id: Date.now().toString(),
      role: "expert",
      text: verdict,
    };
    setMessages((prev) => [...prev, expertMessage]);

    Alert.alert(
      "Uzman görüşü gönderildi",
      "Uzman değerlendirmesi sohbete eklendi."
    );
    setScreen("chat");
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      <View style={styles.header}>
        <Text style={styles.logo}>● Nokta Uzman</Text>
        <Text style={styles.subtitle}>
          İnsan uzman destek katmanı
        </Text>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, screen === "chat" && styles.activeTab]}
          onPress={() => setScreen("chat")}
        >
          <Text style={[styles.tabText, screen === "chat" && styles.activeTabText]}>
            💬 Sohbet
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, screen === "expert" && styles.activeTab]}
          onPress={() => setScreen("expert")}
        >
          <Text style={[styles.tabText, screen === "expert" && styles.activeTabText]}>
            👤 Uzman Kuyruğu ({requests.filter((r) => r.status === "Pending").length})
          </Text>
        </TouchableOpacity>
      </View>

      {screen === "chat" ? (
        <View style={styles.chatScreen}>
          <FlatList
            data={messages}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.messageList}
            renderItem={({ item }) => (
              <View
                style={[
                  styles.messageBubble,
                  item.role === "user" && styles.userBubble,
                  item.role === "expert" && styles.expertBubble,
                ]}
              >
                <Text style={styles.messageRole}>
                  {item.role === "user"
                    ? "Sen"
                    : item.role === "expert"
                      ? "👤 İnsan Uzman"
                      : "● Nokta AI"}
                </Text>
                <Text style={styles.messageText}>{item.text}</Text>
              </View>
            )}
          />

          {loading && (
            <View style={styles.loadingRow}>
              <ActivityIndicator color="#10b981" />
              <Text style={styles.loadingText}>Nokta düşünüyor...</Text>
            </View>
          )}

          <View style={styles.inputBox}>
            <TextInput
              style={styles.input}
              placeholder="Fikrini yaz..."
              placeholderTextColor="#9ca3af"
              value={input}
              onChangeText={setInput}
              multiline
              editable={!loading}
            />
            <TouchableOpacity
              style={[styles.sendButton, loading && styles.sendButtonDisabled]}
              onPress={sendIdea}
              disabled={loading}
            >
              <Text style={styles.sendButtonText}>
                {loading ? "..." : "Gönder"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.queue}>
          {requests.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>Henüz uzman isteği yok</Text>
              <Text style={styles.emptyText}>
                Orta veya yüksek belirsizlik içeren fikirler burada görünecek.
              </Text>
            </View>
          ) : (
            requests.map((request) => (
              <View key={request.id} style={styles.requestCard}>
                <View style={styles.requestTop}>
                  <Text style={styles.requestTitle}>Uzman İnceleme İsteği</Text>
                  <Text
                    style={[
                      styles.badge,
                      request.riskLevel === "High"
                        ? styles.highBadge
                        : styles.mediumBadge,
                    ]}
                  >
                    {request.riskLevel === "High" ? "Yüksek" : "Orta"}
                  </Text>
                </View>

                <Text style={styles.label}>Kullanıcı fikri</Text>
                <Text style={styles.requestText}>{request.idea}</Text>

                <Text style={styles.label}>Nokta AI değerlendirmesi</Text>
                <Text style={styles.requestText}>{request.aiSummary}</Text>

                <Text style={styles.label}>Durum</Text>
                <Text style={styles.requestText}>
                  {request.status === "Pending" ? "⏳ Bekliyor" : "✅ İncelendi"}
                </Text>

                {request.expertVerdict ? (
                  <>
                    <Text style={styles.label}>Uzman görüşü</Text>
                    <Text style={styles.requestText}>
                      {request.expertVerdict}
                    </Text>
                  </>
                ) : (
                  <View style={styles.reviewButtons}>
                    <TouchableOpacity
                      style={styles.reviewButton}
                      onPress={() =>
                        reviewRequest(
                          request.id,
                          "Uzman görüşü: Bu fikir ilgi çekici ancak kapsam, kullanıcı doğrulaması ve risk kontrolü gerektiriyor. Geliştirmeye devam edilebilir."
                        )
                      }
                    >
                      <Text style={styles.reviewButtonText}>
                        🔧 Geliştirme Gerekli
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.reviewButton, styles.approveButton]}
                      onPress={() =>
                        reviewRequest(
                          request.id,
                          "Uzman görüşü: Bu fikir Nokta kuluçka sürecine alınmaya hazır. Önerilen sonraki adım: yapılandırılmış bir spesifikasyon oluşturmak."
                        )
                      }
                    >
                      <Text style={styles.reviewButtonText}>✅ Onayla</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f172a" },
  header: { padding: 20, paddingBottom: 12 },
  logo: { color: "#a7f3d0", fontSize: 22, fontWeight: "800" },
  subtitle: { color: "#cbd5e1", marginTop: 6, fontSize: 14 },
  tabs: { flexDirection: "row", paddingHorizontal: 16, gap: 10, marginBottom: 10 },
  tab: { flex: 1, padding: 12, borderRadius: 14, backgroundColor: "#1e293b", alignItems: "center" },
  activeTab: { backgroundColor: "#10b981" },
  tabText: { color: "#cbd5e1", fontWeight: "700" },
  activeTabText: { color: "#052e16" },
  chatScreen: { flex: 1 },
  messageList: { padding: 16, paddingBottom: 8 },
  messageBubble: { backgroundColor: "#1e293b", padding: 14, borderRadius: 16, marginBottom: 12 },
  userBubble: { backgroundColor: "#334155" },
  expertBubble: { backgroundColor: "#064e3b" },
  messageRole: { color: "#a7f3d0", fontWeight: "800", marginBottom: 6 },
  messageText: { color: "#f8fafc", fontSize: 15, lineHeight: 22 },
  loadingRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 16, paddingBottom: 8 },
  loadingText: { color: "#a7f3d0", fontSize: 14 },
  inputBox: { padding: 14, borderTopWidth: 1, borderTopColor: "#334155", backgroundColor: "#0f172a" },
  input: { minHeight: 80, backgroundColor: "#1e293b", color: "white", padding: 14, borderRadius: 16, textAlignVertical: "top", marginBottom: 10 },
  sendButton: { backgroundColor: "#10b981", padding: 15, borderRadius: 16, alignItems: "center" },
  sendButtonDisabled: { backgroundColor: "#065f46" },
  sendButtonText: { color: "#052e16", fontWeight: "900", fontSize: 16 },
  queue: { padding: 16 },
  emptyCard: { backgroundColor: "#1e293b", padding: 20, borderRadius: 18 },
  emptyTitle: { color: "white", fontSize: 18, fontWeight: "800", marginBottom: 8 },
  emptyText: { color: "#cbd5e1", lineHeight: 22 },
  requestCard: { backgroundColor: "#1e293b", borderRadius: 18, padding: 16, marginBottom: 16 },
  requestTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  requestTitle: { color: "white", fontSize: 17, fontWeight: "800" },
  badge: { overflow: "hidden", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, color: "white", fontWeight: "800" },
  mediumBadge: { backgroundColor: "#d97706" },
  highBadge: { backgroundColor: "#dc2626" },
  label: { color: "#a7f3d0", fontWeight: "800", marginTop: 10, marginBottom: 4 },
  requestText: { color: "#e2e8f0", lineHeight: 21 },
  reviewButtons: { flexDirection: "row", gap: 10, marginTop: 16 },
  reviewButton: { flex: 1, backgroundColor: "#475569", padding: 13, borderRadius: 14, alignItems: "center" },
  approveButton: { backgroundColor: "#10b981" },
  reviewButtonText: { color: "white", fontWeight: "900" },
});